/**
 * OpenID Connect configuration for Keycloak.
 *
 * Values come from Vite env vars (see `.env.example`) and fall back to sensible
 * local-development defaults for the `crm-realm` realm and the `crm-spa` public
 * client. Keycloak's endpoint paths are stable, so we derive them from the
 * realm authority instead of doing a `.well-known` discovery round-trip.
 */

const env = import.meta.env;

const authority = (
  env.VITE_OIDC_AUTHORITY ?? "http://localhost:8180/realms/crm-realm"
).replace(/\/+$/, "");

export const oidcConfig = {
  /** Realm issuer, e.g. https://keycloak.example.com/realms/crm-realm */
  authority,
  clientId: env.VITE_OIDC_CLIENT_ID ?? "crm-spa",
  redirectUri:
    env.VITE_OIDC_REDIRECT_URI ?? `${window.location.origin}/auth/callback`,
  postLogoutRedirectUri:
    env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? window.location.origin,
  scope: env.VITE_OIDC_SCOPE ?? "openid profile email",
  /** Standard Keycloak OIDC endpoints, derived from the realm authority. */
  endpoints: {
    authorization: `${authority}/protocol/openid-connect/auth`,
    token: `${authority}/protocol/openid-connect/token`,
    endSession: `${authority}/protocol/openid-connect/logout`,
    userinfo: `${authority}/protocol/openid-connect/userinfo`,
  },
} as const;

export type OidcConfig = typeof oidcConfig;