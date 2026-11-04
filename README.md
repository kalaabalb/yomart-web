# YoMart Customer Storefront

The customer-facing React/Vite storefront is a separate web client. It does not replace the Flutter app. Catalog, prices, inventory, payment settings, customer sessions, and orders come from the YoMart API; the browser is never authoritative for prices or stock.

## Customer experience

- Public home, catalog, product details, support, and cart. Guests can browse and keep a local cart.
- Search matches product names. Category and in-stock filters use the public `/products` query options. The current API does not provide pagination or brand filtering.
- Brands and collections are displayed from public API data. Collection cards currently link to the general catalog; a dedicated collection-filter route is not supported.
- Product details display API images, name, description, price, category, optional brand, and availability. Variant choice UI is not implemented. Products with declared variants are blocked from cart/checkout because the API order contract does not validate a selected variant's price and stock.
- Cart persists only product IDs and quantities in browser local storage. Current product prices and availability are re-read from the API. The shown subtotal is an estimate.
- Customer JWTs are held in JavaScript memory and clear on page reload/logout. There is no refresh-token or password-recovery flow.
- Checkout requires a signed-in customer, required destination phone/city, optional area, and an active payment method returned by the checkout settings endpoint. Staff and customer agree a collection point separately; there is no delivery fee.
- For methods requiring proof, the UI accepts JPEG, PNG, or WebP up to 10 MiB and uses the proof upload endpoint. It stores a proof record ID, not a provider URL. Provider privacy and legacy receipt remediation still require staging/security acceptance.
- Order submission sends item IDs/quantities, destination information, payment method, optional proof record ID, and a stable `Idempotency-Key`. The backend recalculates prices and stock. No payment gateway is integrated.
- Order confirmation/history/details and account summary are customer-authenticated and use customer-scoped API routes. Profile editing and account deletion are not available here.
- Customer support contacts are loaded dynamically; there are no hardcoded phone numbers or social handles.

## Routes

| Route | Access |
| --- | --- |
| `/` | Public home |
| `/products` | Public catalog/search/filter |
| `/products/:id` | Public product details |
| `/cart` | Public local cart |
| `/support` | Public support contacts |
| `/login`, `/register` | Public authentication |
| `/checkout` | Customer session |
| `/checkout/confirmation/:id` | Customer session |
| `/orders`, `/orders/:id` | Customer session |
| `/account` | Customer session |

Protected browser routes are only a UI convenience. The API independently enforces customer ownership and administrator authorization.

## API contract

The storefront uses the backend's `{ success, message, data }` response envelope and these existing routes:

| Purpose | API |
| --- | --- |
| Products/search/category/stock | `GET /products`, `GET /products/:id` |
| Categories, brands, collections, posters | `GET /categories`, `/brands`, `/collections`, `/posters` |
| Retailer contacts | `GET /retailer-contacts` |
| Registration/login/profile | `POST /users/register`, `POST /users/login`, `GET /users/profile` |
| Checkout settings | `GET /store-settings/checkout` (read-only customer projection) |
| Payment proof | `POST /payment/upload-proof-base64` (authenticated, validated upload; response contains proof record ID, not provider URL) |
| Create order | `POST /orders` with `Idempotency-Key`; server validates method, account, product status, price, inventory, and proof ownership |
| Customer orders | `GET /orders`, `GET /orders/:id` |

Capabilities such as collection-specific browsing, product variant selection, token refresh, password reset, and payment gateway processing are not provided by this storefront/API contract and are not simulated.

These are code-level integrations; this publication task does not submit orders, upload payment evidence, access production data, or claim hosted acceptance. Legacy public payment-proof URLs remain a release blocker until restricted/reconciled and verified.

## Local development

Requirements: Node.js/npm compatible with the checked-in lockfile.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local` is Git-ignored. Configure the backend CORS list to include the exact local storefront origin. Never place secrets in `VITE_*` variables: Vite embeds those values into browser code.

## Tests and build

```sh
npm test
npm run build
```

The build requires an explicit `YOMART_BUILD_ENV`, API origin, matching expected API origin, and expected site origin. It removes the selected output directory before preflight and on failure so an old bundle is not left behind. Local/staging output receives a `noindex,nofollow,noarchive` robots meta directive. Its `robots.txt` permits crawlers to read that directive; this is not access control. Production output is not marked noindex.

### Render Static Site settings for staging

- Service: `yomart` if available; Render must confirm the assigned hostname.
- Repository: `kalaabalb/yomart-web`; branch `main`; root directory repository root.
- Build command: `npm ci && npm run build`.
- Publish directory: `dist`.
- Rewrite: `/*` to `/index.html` for React Router direct routes and refreshes.

Requested customer origin: `https://yomart.onrender.com`. This is the intended build target, not a claim that Render has assigned it. Confirm the actual Static Site URL before enabling the service or relying on runtime origin checks.

Staging build variables (all are public origins/mode flags, no secrets):

```text
YOMART_BUILD_ENV=staging
VITE_API_BASE_URL=https://yomart-api.onrender.com
YOMART_EXPECTED_API_ORIGIN=https://yomart-api.onrender.com
VITE_EXPECTED_SITE_ORIGIN=https://yomart.onrender.com
YOMART_NO_PRODUCTION_API=true
YOMART_PRODUCTION_API_ORIGINS=(empty or unset)
YOMART_PRODUCTION_SITE_ORIGINS=(empty or unset until confirmed)
```

The production API and site denylist values may be empty or unset for staging while production origins are unconfirmed. Any supplied denylist entries are individually validated as bare HTTPS origins: no wildcard, credentials, paths, query, or fragment. The staging API must match `YOMART_EXPECTED_API_ORIGIN`, and API and site denylist checks remain separate. `YOMART_NO_PRODUCTION_API=true` may remain as a deployment annotation, but the build no longer requires it. A blank denylist cannot detect an origin that has not been identified; do not invent production domains.

Production builds remain unbuilt and require non-empty, verified `YOMART_STAGING_API_ORIGINS` and `YOMART_STAGING_SITE_ORIGINS`. Production origins are not specified here.

## Security and release status

- No credentials are required in the browser build. Environment files, `node_modules`, and `dist` are excluded from Git.
- The API's CORS allowlist must contain the exact deployed storefront HTTPS origin; it must not use a wildcard in staging/production.
- Payment-proof provider access, legacy public receipts, legal retention wording, backup/restore, production domains, and hosted acceptance remain outstanding. Do not treat a successful static build as approval to accept real payments or publish a production storefront.
- Staging is expected to be noindexed. Search indexing/ranking is not guaranteed by this client-rendered application; meaningful product search pages need an approved production SEO strategy and truthful backend data.
