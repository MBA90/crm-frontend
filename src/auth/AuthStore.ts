import { oidcConfig } from "@/auth/oidcConfig";
import { decodeJwt, pkceChallenge, randomString } from "@/auth/crypto";

/** Where the in-flight login handshake stashes its one-time values. */
const TX_KEY = "crm-auth.tx";
/** Where the active session (tokens) is persisted across reloads. */
const SESSION_KEY = "crm-auth.session";

/** Refresh the access token this many ms before it actually expires. */
const REFRESH_SKEW_MS = 30_000;

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  sub: string;
  username?: string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
}

interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  /** Absolute expiry of the access token, epoch ms. */
  expiresAt: number;
}

/** Values persisted between the authorize redirect and the callback. */
interface LoginTransaction {
  codeVerifier: string;
  state: string;
  nonce: string;
  returnTo: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

type Listener = () => void;

/** Claims we read off Keycloak's ID / access tokens. */
interface KeycloakClaims {
  sub: string;
  preferred_username?: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  nonce?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

/**
 * Observable auth store implementing the OAuth2 Authorization Code flow with
 * PKCE against Keycloak, by hand (no keycloak-js). It mirrors the CrmStore
 * pattern: components `subscribe` and read `getState()`.
 *
 * Tokens live in sessionStorage so a page reload keeps you signed in but
 * closing the tab ends the session. The access token is transparently
 * refreshed via the refresh_token grant shortly before it expires.
 */
class AuthStore {
  private state: AuthState = { status: "loading", user: null, error: null };
  private session: StoredSession | null = null;
  private listeners = new Set<Listener>();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshInFlight: Promise<string | null> | null = null;

  constructor() {
    this.restore();
  }

  // ---- observable surface ------------------------------------------------
  getState(): AuthState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(patch: Partial<AuthState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  // ---- bootstrap ---------------------------------------------------------
  /** Restore a persisted session on startup and (re)establish auth status. */
  private restore(): void {
    const session = this.loadSession();
    if (!session) {
      this.setState({ status: "unauthenticated", user: null });
      return;
    }
    this.session = session;
    if (Date.now() < session.expiresAt - REFRESH_SKEW_MS) {
      this.applySession(session);
      return;
    }
    // Access token expired/expiring: try a silent refresh, else sign out.
    if (session.refreshToken) {
      void this.refresh().then((token) => {
        if (!token) this.clearSession("unauthenticated");
      });
    } else {
      this.clearSession("unauthenticated");
    }
  }

  // ---- login -------------------------------------------------------------
  /**
   * Begin the Authorization Code + PKCE flow by redirecting the browser to
   * Keycloak's authorization endpoint. `returnTo` is where we land after login.
   */
  async login(returnTo = window.location.pathname + window.location.search): Promise<void> {
    const codeVerifier = randomString(32);
    const codeChallenge = await pkceChallenge(codeVerifier);
    const tx: LoginTransaction = {
      codeVerifier,
      state: randomString(16),
      nonce: randomString(16),
      returnTo:
        returnTo.startsWith("/auth/callback") || returnTo.startsWith("/login")
          ? "/"
          : returnTo,
    };
    sessionStorage.setItem(TX_KEY, JSON.stringify(tx));

    const params = new URLSearchParams({
      client_id: oidcConfig.clientId,
      redirect_uri: oidcConfig.redirectUri,
      response_type: "code",
      scope: oidcConfig.scope,
      state: tx.state,
      nonce: tx.nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    window.location.assign(`${oidcConfig.endpoints.authorization}?${params}`);
  }

  /**
   * Complete the flow on the redirect back from Keycloak: validate `state`,
   * exchange the authorization `code` for tokens, and start the session.
   * Returns the path the user should be sent to.
   */
  async completeLogin(): Promise<string> {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const error = params.get("error");
    if (error) {
      throw new Error(params.get("error_description") ?? error);
    }
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) throw new Error("Missing authorization code or state.");

    const raw = sessionStorage.getItem(TX_KEY);
    if (!raw) throw new Error("No login transaction in progress.");
    const tx = JSON.parse(raw) as LoginTransaction;
    sessionStorage.removeItem(TX_KEY);

    if (state !== tx.state) throw new Error("State mismatch — possible CSRF.");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: oidcConfig.clientId,
      code,
      redirect_uri: oidcConfig.redirectUri,
      code_verifier: tx.codeVerifier,
    });
    const tokens = await this.postToken(body);

    if (tokens.id_token) {
      const claims = decodeJwt<KeycloakClaims>(tokens.id_token);
      if (claims.nonce && claims.nonce !== tx.nonce) {
        throw new Error("Nonce mismatch — possible replay.");
      }
    }

    this.startSession(tokens);
    return tx.returnTo || "/";
  }

  // ---- token access ------------------------------------------------------
  /**
   * Return a currently-valid access token, refreshing first if it is about to
   * expire. Use this to authorize API calls: `Authorization: Bearer <token>`.
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.session) return null;
    if (Date.now() < this.session.expiresAt - REFRESH_SKEW_MS) {
      return this.session.accessToken;
    }
    return this.refresh();
  }

  // ---- logout ------------------------------------------------------------
  /** End the session locally and at Keycloak's end-session endpoint. */
  logout(): void {
    const idToken = this.session?.idToken;
    this.clearSession("unauthenticated");

    const params = new URLSearchParams({
      client_id: oidcConfig.clientId,
      post_logout_redirect_uri: oidcConfig.postLogoutRedirectUri,
    });
    if (idToken) params.set("id_token_hint", idToken);
    window.location.assign(`${oidcConfig.endpoints.endSession}?${params}`);
  }

  // ---- internals ---------------------------------------------------------
  private async refresh(): Promise<string | null> {
    if (!this.session?.refreshToken) return null;
    // Collapse concurrent refreshes into one in-flight request.
    if (this.refreshInFlight) return this.refreshInFlight;

    const refreshToken = this.session.refreshToken;
    this.refreshInFlight = (async () => {
      try {
        const body = new URLSearchParams({
          grant_type: "refresh_token",
          client_id: oidcConfig.clientId,
          refresh_token: refreshToken,
        });
        const tokens = await this.postToken(body);
        this.startSession(tokens);
        return tokens.access_token;
      } catch {
        this.clearSession("unauthenticated");
        return null;
      } finally {
        this.refreshInFlight = null;
      }
    })();
    return this.refreshInFlight;
  }

  private async postToken(body: URLSearchParams): Promise<TokenResponse> {
    const res = await fetch(oidcConfig.endpoints.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const json = await res.json();
        detail = json.error_description ?? json.error ?? detail;
      } catch {
        /* non-JSON error body */
      }
      throw new Error(`Token request failed: ${detail}`);
    }
    return (await res.json()) as TokenResponse;
  }

  private startSession(tokens: TokenResponse): void {
    const session: StoredSession = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    this.session = session;
    this.saveSession(session);
    this.applySession(session);
  }

  private applySession(session: StoredSession): void {
    this.setState({
      status: "authenticated",
      user: this.userFromSession(session),
      error: null,
    });
    this.scheduleRefresh(session.expiresAt);
  }

  private userFromSession(session: StoredSession): AuthUser {
    const claims = decodeJwt<KeycloakClaims>(
      session.idToken ?? session.accessToken
    );
    // Role mappers aren't guaranteed to be attached to the ID token, only to
    // the access token (which is what the backend actually authorizes against).
    // Decode roles from the access token specifically so `roles` always
    // reflects what the API will accept, even when idToken is present but bare.
    const roleClaims = session.idToken
      ? decodeJwt<KeycloakClaims>(session.accessToken)
      : claims;
    const realmRoles = roleClaims.realm_access?.roles ?? [];
    const clientRoles =
      roleClaims.resource_access?.[oidcConfig.clientId]?.roles ?? [];
    return {
      sub: claims.sub,
      username: claims.preferred_username,
      name: claims.name,
      email: claims.email,
      firstName: claims.given_name,
      lastName: claims.family_name,
      roles: Array.from(new Set([...realmRoles, ...clientRoles])),
    };
  }

  private scheduleRefresh(expiresAt: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const delay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, 0);
    this.refreshTimer = setTimeout(() => void this.refresh(), delay);
  }

  private clearSession(status: AuthStatus): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    this.session = null;
    sessionStorage.removeItem(SESSION_KEY);
    this.setState({ status, user: null });
  }

  private saveSession(session: StoredSession): void {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* storage may be unavailable; keep the session in memory */
    }
  }

  private loadSession(): StoredSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  }
}

export const authStore = new AuthStore();