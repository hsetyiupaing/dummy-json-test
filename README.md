# Stockroom Studio

Stockroom Studio is a responsive application with a management dashboard and a customer storefront, built with React 19, TypeScript, Vite, and Tailwind CSS. DummyJSON provides authentication, product, category, and sample cart data.

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
- Admin and Moderator accounts can access the dashboard and product pages; Admin-only routes cover Users & Roles, Categories, and Settings. All authenticated roles can use the customer storefront.
- The Products page loads and searches DummyJSON data, with category, stock availability, and price filters; sortable columns and page sizes of 10, 20, or 30.
- Product detail pages support direct links, a selectable image gallery, product specifications, pricing, stock, rating, and loading/error/not-found states.
- The Users & Roles page shows DummyJSON users and clearly separates the API's `role` field from the local app-role assignment.
- The storefront home, catalog, and product detail pages use the current DummyJSON product and category data. Catalog search, category selection, sorting, pagination, and add-to-cart are available to authenticated customers.
- The customer cart starts from `GET /carts/user/:id` for the signed-in DummyJSON user and then saves edits per user in local browser storage. Checkout creates a simulated local order; it does not collect payment or persist changes to DummyJSON.
- Account and order-history pages use the authenticated API profile and locally persisted demo orders. Category management reads actual category metadata and category products; DummyJSON does not support persistent category CRUD.
- Admin and storefront routes use separate layouts and explicit nested route definitions. The sidebar no longer includes a fictional plan/team-members card.
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
│   ├── categories/              # Admin category discovery and category products
│   ├── settings/                # Signed-in account and demo authorization settings
│   ├── storefront/              # Customer layout, products, cart, checkout, and orders
│   └── users/                   # Admin user-directory feature
├── lib/
│   └── api.ts                   # Shared Axios instance
├── App.tsx                      # Router, dashboard shell, and current overview
├── index.css                    # Tailwind import, design tokens, and responsive styles
└── main.tsx                     # React entry point
```

Authentication state and API identity live in AuthContext. The app role is derived separately by the authorization mapping; it does not use DummyJSON's `role` field. API requests live in service functions, and TanStack Query owns product, category, and sample-cart request lifecycles. Browser storage keys cart and demo-order records by the authenticated DummyJSON user ID.

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
| Sample carts by user | `GET /carts/user/:id` |
| Create product | `POST /products/add` |
| Update product | `PATCH /products/:id` |
| Delete product | `DELETE /products/:id` |

The user directory uses `GET /users` and `GET /users/search?q=` with DummyJSON's `select` parameter for directory fields only.

## Development phases

Authentication, route protection, role-based navigation, product browsing, the customer storefront, and read-only category management are implemented. Product and cart mutations in DummyJSON are simulated; checkout and order history are local demo behavior.
