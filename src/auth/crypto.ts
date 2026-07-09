/**
 * Small self-contained crypto helpers for the OAuth2 Authorization Code + PKCE
 * flow. Everything here relies on the browser's native Web Crypto API — no
 * external OIDC/Keycloak library is used.
 */

/** Base64url-encode raw bytes (RFC 4648 §5, no padding). */
function base64UrlEncode(bytes: Uint8Array): string {
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Cryptographically random, URL-safe string. Used for the PKCE `code_verifier`,
 * the CSRF `state`, and the OIDC `nonce`.
 */
export function randomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** Derive the S256 PKCE `code_challenge` from a `code_verifier`. */
export async function pkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Decode a JWT payload without verifying its signature. Signature verification
 * is the token endpoint's job over TLS; on the client we only read claims
 * (user profile, roles, expiry) for display and scheduling.
 */
export function decodeJwt<T = Record<string, unknown>>(token: string): T {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Malformed JWT: missing payload segment.");
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json) as T;
}