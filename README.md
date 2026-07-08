# CRM Frontend

A full CRM frontend built with **React 18 + TypeScript**, using **class components throughout**.

## Features

- **Dashboard** — KPIs (open pipeline, weighted forecast, won revenue, win rate), pipeline-by-stage breakdown, recent activity feed, upcoming tasks, and top open deals.
- **Pipeline (Deals)** — drag-and-drop Kanban board across stages (Lead → Qualified → Proposal → Negotiation → Won / Lost) plus a sortable list view. Full create / edit / delete.
- **Contacts** — searchable, filterable table with a per-contact detail page showing linked deals and tasks. Full CRUD.
- **Companies** — account cards with live contact / deal / pipeline stats. Full CRUD.
- **Tasks** — open / completed / all filters, priority + type, due-date and overdue highlighting, one-click completion.
- **Global search** in the top bar across contacts, companies, and deals.
- **Settings** — workspace summary, reload demo data, or clear everything.
- Toast notifications, keyboard-dismissable modals, empty states, and a responsive layout that collapses the sidebar on smaller screens.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

Requires Node 18+.

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
└── pages/                    # Dashboard, Deals, Contacts, ContactDetail, Companies, Tasks, Settings
```
