# Stockroom Studio

Stockroom Studio is a responsive product management dashboard built with React 19, TypeScript, Vite, and Tailwind CSS. It uses DummyJSON as its product API and is structured to keep API access, feature code, and the shared application shell separate.

## Getting started

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

The development server prints the local URL. Use `npm run build` to run the TypeScript project checks and create a production bundle. Use `npm run lint` to run ESLint.

## Current implementation

- Responsive dashboard shell with desktop sidebar collapse and mobile navigation.
- Overview page with summary cards, a revenue trend visualization, category distribution, and recently added product table.
- Routes are in place for Overview, Products, Users & roles, Categories, and Settings. Product details and the user directory are API-backed; Categories and Settings are still phase placeholders.
- The Products page loads and searches DummyJSON data, with category, stock availability, and price filters; sortable columns and page sizes of 10, 20, or 30.
- Product detail pages support direct links, a selectable image gallery, product specifications, pricing, stock, rating, and loading/error/not-found states.
- The Users & roles page reads DummyJSON roles, summarizes admin/moderator/user permissions, and includes user search, role filtering, and pagination.
- A global demo role selector gates the users route according to the frontend permission map; it is a UI demonstration and does not authenticate users or secure API requests.
- Product requests and category metadata use TanStack Query caches. The catalogue fetches the full result set so local filters and sorting apply consistently across pages.
- Typed Axios client and service functions cover product listing, details, search, categories, category filtering, create, update, and delete.
- Dashboard figures and recent product rows remain presentation placeholders until the dashboard data phase.

## Architecture

```text
src/
├── components/                 # Shared UI and layout components as the app grows
├── features/
│   ├── products/
│   │   ├── services/            # DummyJSON product requests
│   │   └── types/               # Shared product and category models
│   └── users/
│       ├── services/            # Restricted-field DummyJSON user directory requests
│       ├── permissions.ts       # Role-to-permission map
│       └── RoleProvider.tsx     # Demo role selection context
├── lib/
│   └── api.ts                   # Shared Axios instance
├── App.tsx                      # Router, dashboard shell, and current overview
├── index.css                    # Tailwind import, design tokens, and responsive styles
└── main.tsx                     # React entry point
```

API requests live in service functions, so React components and query hooks can reuse the same typed operations. TanStack Query will own request lifecycle and cache synchronization as the CRUD screens are introduced.

## DummyJSON behavior

The API base URL is `https://dummyjson.com`. Product write endpoints simulate create, update, and delete operations; the server does not persist those changes. The client must therefore apply mutation results to its TanStack Query cache so changes remain visible during the current session. A page refresh reloads the server's original data.

The users page uses DummyJSON's seeded `admin`, `moderator`, and `user` roles. It requests only `id`, `firstName`, `lastName`, `email`, `username`, `image`, and `role`, avoiding unrelated sensitive profile and payment fields. The role switcher is a local demonstration control; it does not sign in as a directory user, update API records, or provide server-side authorization. User-directory roles and simulated product changes return to server seed data after a refresh.

The service layer exposes:

| Operation | Endpoint |
| --- | --- |
| List products | `GET /products` |
| Product details | `GET /products/:id` |
| Search products | `GET /products/search?q=` |
| Categories | `GET /products/categories` |
| Products by category | `GET /products/category/:category` |
| Create product | `POST /products/add` |
| Update product | `PATCH /products/:id` |
| Delete product | `DELETE /products/:id` |

The user directory uses `GET /users` and `GET /users/search?q=` with DummyJSON's `select` parameter for the directory fields only. The frontend permission map grants admins full product and user management, moderators product create/update plus user viewing, and users product viewing. These rules only control visible app routes and controls.

## Development phases

The implementation follows the incremental phases in the original project brief. Completed phases are the initial project setup, dashboard layout and routing, typed Axios API services, the product listing with search, filters, sorting, and pagination, product details, and the requested user directory/RBAC demo. The next phase adds the reusable create/edit product form.
