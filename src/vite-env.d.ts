/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Keycloak realm issuer, e.g. https://kc.example.com/realms/crm-realm */
  readonly VITE_OIDC_AUTHORITY?: string;
  /** Public client id registered in the realm (crm-spa). */
  readonly VITE_OIDC_CLIENT_ID?: string;
  /** Redirect URI registered on the client; defaults to <origin>/auth/callback. */
  readonly VITE_OIDC_REDIRECT_URI?: string;
  /** Where Keycloak returns after logout; defaults to <origin>. */
  readonly VITE_OIDC_POST_LOGOUT_REDIRECT_URI?: string;
  /** OAuth scopes; defaults to "openid profile email". */
  readonly VITE_OIDC_SCOPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}