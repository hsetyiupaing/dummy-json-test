# Stockroom Studio

Stockroom Studio is a responsive application with a management dashboard and a planned customer storefront, built with React 19, TypeScript, Vite, and Tailwind CSS. DummyJSON provides authentication and product data.

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
- Login uses DummyJSON authentication. Authenticated routes restore and validate the session, then direct users to `/admin/dashboard` or `/shop` based on a separate demo application-role mapping.
- Admin and Moderator accounts can access the existing dashboard and product pages; Admin-only routes cover Users & Roles, Categories, and Settings. The storefront route is an authenticated placeholder until Phase C/D.
- The Products page loads and searches DummyJSON data, with category, stock availability, and price filters; sortable columns and page sizes of 10, 20, or 30.
- Product detail pages support direct links, a selectable image gallery, product specifications, pricing, stock, rating, and loading/error/not-found states.
- The Users & Roles page shows DummyJSON users and clearly separates the API's `role` field from the local app-role assignment.
- Product requests and category metadata use TanStack Query caches. The catalogue fetches the full result set so local filters and sorting apply consistently across pages.
- Typed Axios client and service functions cover product listing, details, search, categories, category filtering, create, update, and delete.
- Dashboard figures and recent product rows remain presentation placeholders until the dashboard data phase.
- Phases A and B provide a custom username/password login, centralized authentication state, remember-me storage, session restoration, logout, and role-based route redirects.

## Architecture

```text
src/
├── components/                 # Shared UI and layout components as the app grows
├── features/
│   ├── auth/
│   │   ├── AuthContext.tsx      # Login, logout, and session restoration
│   │   ├── authService.ts       # DummyJSON authentication requests
│   │   ├── authStorage.ts       # Remembered and tab-scoped session storage
│   │   ├── demoRoles.ts         # Local app-role assignments and landing paths
│   │   └── guards.tsx           # Authentication and role route guards
│   ├── products/
│   │   ├── services/            # DummyJSON product requests
│   │   └── types/               # Shared product and category models
│   └── users/                   # Admin user-directory feature
├── lib/
│   └── api.ts                   # Shared Axios instance
├── App.tsx                      # Router, dashboard shell, and current overview
├── index.css                    # Tailwind import, design tokens, and responsive styles
└── main.tsx                     # React entry point
```

Authentication state and API identity live in AuthContext. The app role is derived separately by the authorization mapping; it does not use DummyJSON's `role` field. API requests live in service functions, and TanStack Query owns product request lifecycle and cache synchronization.

## DummyJSON behavior

The API base URL is `https://dummyjson.com`. Product write endpoints simulate create, update, and delete operations; the server does not persist those changes. The client must therefore apply mutation results to its TanStack Query cache so changes remain visible during the current session. A page refresh reloads the server's original data.

DummyJSON login accepts a username and password. The login page posts those credentials to `POST /auth/login` and the application displays the returned user profile. On startup the app validates a stored token with `GET /auth/me`. Remember me stores the session in localStorage; otherwise it uses sessionStorage. Logout clears both stores and in-memory identity.

The app's `ADMIN`, `MODERATOR`, and `USER` roles are local demo assignments keyed by DummyJSON user id (`1`, `2`, and `3` respectively); unknown ids default to `USER`. DummyJSON does not provide or enforce these application roles. Frontend route restrictions are for demonstration and are not server-side authorization.

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

The user directory uses `GET /users` and `GET /users/search?q=` with DummyJSON's `select` parameter for directory fields only.

## Development phases

The revised application plan has completed Phase A (login/authentication integration) and Phase B (central auth state, persistence, and role-based redirects). Phase C will separate the admin and storefront layouts.
