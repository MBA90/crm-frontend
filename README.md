# Sanad

**Sanad** (Arabic *سند* — "support / a pillar you lean on") is a full CRM frontend
built with **React 18 + TypeScript**, using **class components throughout**.
Keycloak single sign-on gates the app behind a branded public sign-in page.

## Features

- **Dashboard** — KPIs (open pipeline, weighted forecast, won revenue, win rate), pipeline-by-stage breakdown, recent activity feed, upcoming tasks, and top open deals.
- **Pipeline (Deals)** — drag-and-drop Kanban board across stages (Lead → Qualified → Proposal → Negotiation → Won / Lost) plus a sortable list view. Full create / edit / delete.
- **Contacts** — searchable, filterable table with a per-contact detail page showing linked deals and tasks. Full CRUD.
- **Companies** — account cards with live contact / deal / pipeline stats. Full CRUD.
- **Tasks** — open / completed / all filters, priority + type, due-date and overdue highlighting, one-click completion.
- **Global search** in the top bar across contacts, companies, and deals.
- **Settings** — workspace summary, reload demo data, or clear everything.
- **Sign-in page** — a public, branded `/login` screen: a split layout with an animated aurora brand panel and a single-sign-on button that starts the Keycloak flow (no auto-redirect), fully responsive.
- Toast notifications, keyboard-dismissable modals, empty states, and a responsive layout that collapses the sidebar on smaller screens.

## Getting started

```bash
npm install
cp .env.example .env.local   # point at your Keycloak instance
npm run dev                  # start the dev server (http://localhost:5174)
```

Requires Node 18+. The dev server is pinned to port **5174** (`strictPort`), so it
fails fast if the port is busy rather than silently switching ports.

## Authentication (Keycloak)

Users sign in through **Keycloak** using the **OAuth2 Authorization Code flow with
PKCE**. The flow is implemented by hand with the browser's Web Crypto + fetch APIs —
**no `keycloak-js` / oidc-client dependency**.

- Realm: `crm-realm` · Client: `crm-spa` (public, PKCE — no client secret)
- Config comes from `VITE_OIDC_*` env vars (see `.env.example`); defaults target
  `http://localhost:8180/realms/crm-realm`.
- The whole app is gated behind `RequireAuth`; unauthenticated visitors are
  redirected to the public `/login` page (their intended path is remembered).
  Clicking **Continue with single sign-on** starts the Keycloak flow, and
  `/auth/callback` exchanges the code for tokens before returning them to where
  they were headed.
- Tokens live in `sessionStorage` and the access token is silently refreshed via
  the `refresh_token` grant shortly before expiry. Sign out hits Keycloak's
  end-session endpoint.
- Call `authStore.getAccessToken()` to attach `Authorization: Bearer <token>` to
  your API requests.

### Required Keycloak client settings (`crm-spa`)

| Setting | Value |
| --- | --- |
| Client type | OpenID Connect, **Public** |
| Standard flow | Enabled (Authorization Code) |
| PKCE method | `S256` (Advanced → Proof Key for Code Exchange) |
| Valid redirect URIs | `http://localhost:5174/auth/callback` (+ your prod URL) |
| Valid post-logout redirect URIs | `http://localhost:5174` (+ your prod URL) |
| Web origins | `http://localhost:5174` (enables CORS on the token endpoint) |

**Auth-related files:** `src/auth/` — `crypto.ts` (PKCE/JWT helpers),
`oidcConfig.ts`, `AuthStore.ts` (the flow), `RequireAuth.tsx`, `AuthScreen.tsx`;
plus `src/pages/LoginPage.tsx` (public sign-in page) and
`src/pages/AuthCallbackPage.tsx`.

## Architecture

Everything is a **class component**. State lives in a small observable store rather than an external state library.

```
src/
├── main.tsx                  # entry point
├── App.tsx                   # class component; React Router routes
├── types/index.ts            # domain models + stage metadata
├── data/seed.ts              # demo dataset
├── store/
│   ├── CrmStore.ts           # observable singleton: CRUD + localStorage + activity log
│   └── StoreComponent.tsx    # base class that subscribes/unsubscribes to the store
├── lib/
│   ├── format.ts             # currency/date/name/color helpers
│   └── withRouter.tsx        # HOC re-adding router props to class components
├── components/
│   ├── layout/               # AppLayout, Sidebar, Topbar (global search)
│   ├── ui/                   # Icon, Avatar, Badge, Modal, ConfirmDialog, EmptyState, Toast
│   └── forms/                # ContactForm, CompanyForm, DealForm, TaskForm
└── pages/                    # Dashboard, Deals, Contacts, ContactDetail, Companies, Tasks, Settings, Login, AuthCallback
```
