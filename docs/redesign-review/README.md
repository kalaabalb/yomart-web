# YoMart storefront redesign review

These are Chromium screenshots of the local React storefront, captured at the viewports below. They show the implementation at this review point and are not store-listing artwork or a claim that the catalog is approved for public sale.

## Capture setup

- Desktop viewport: **1440 × 1000 CSS pixels**.
- Mobile viewport: **390 × 844 CSS pixels**.
- Browser: Playwright with Chromium.
- Public catalog data: read-only responses from `https://yomart-api.onrender.com`, routed through a temporary local GET-only proxy because the API does not allow the local preview origin. The proxy and capture script were kept outside this repository.
- The API returned 8 products, 4 categories, 2 brands, and 2 collections during capture. The repository release README identifies the 8 active products as synthetic review records. The names and images shown are real public API responses, not fabricated, but they are not owner-approved launch inventory.
- The API responses used for these screenshots did not include usable prices or stock quantities. The UI therefore masks price/availability and does not show a stock count. The owner has not approved the staging records, images, prices, or copy as launch catalog content.
- The cart screenshot is empty because this non-production build disables add-to-cart and checkout. No order, account, login, cart write, or database mutation was made.
- Sign-in validation screenshots show empty-field client validation only. No credentials were entered and no login or registration request was submitted.
- Collection copy comes from the staging API and may contain staging-oriented wording. Review and replace catalog-managed copy before public launch.
- Browser capture recorded canceled local requests (`ERR_ABORTED`) as pages and catalog requests settled; it recorded no console errors, runtime exceptions, or HTTP error responses in the final screenshot pass. A focused homepage check also saw only these local cancellations.

## Desktop screenshots

All files in `desktop/` use the 1440 × 1000 viewport.

| Screenshot | What it shows |
|---|---|
| `homepage.webp` | Homepage with live API-driven categories, products, collections, and brands. |
| `catalog.webp` | Product browse page, search field, category filters, and in-stock filter. |
| `product.webp` | Product detail page using a public catalog product. |
| `product-image-hover.webp` | Product image hover interaction. |
| `keyboard-focus.webp` | Keyboard focus treatment on the product detail back link. |
| `collections-and-brands.webp` | Homepage collections and brands in context. |
| `collections-section.webp` | Collection section close-up. |
| `brands-section.webp` | Brand section close-up. |
| `cart.webp` | Empty cart in preview mode. |
| `sign-in.webp` | Sign-in page. |
| `sign-in-validation.webp` | Empty sign-in form validation state. |
| `create-account.webp` | Account registration page. |
| `help-center.webp` | Customer support page. |
| `404.webp` | Unknown-route not-found page. |
| `page-transition.webp` | Shop navigation transition. |

## Mobile screenshots

All files in `mobile/` use the 390 × 844 viewport.

| Screenshot | What it shows |
|---|---|
| `homepage.webp` | Responsive homepage with public API catalog content. |
| `catalog.webp` | Mobile product browse, filters, and responsive product grid. |
| `product.webp` | Mobile product detail page. |
| `navigation-menu.webp` | Open mobile navigation menu. |
| `collections-and-brands.webp` | Homepage collections and brands in context. |
| `collections-section.webp` | Mobile collection cards. |
| `brands-section.webp` | Mobile brand section. |
| `cart.webp` | Empty cart in preview mode. |
| `sign-in.webp` | Mobile sign-in page. |
| `sign-in-validation.webp` | Empty sign-in form validation state. |
| `create-account.webp` | Mobile account registration page. |
| `help-center.webp` | Mobile customer support page. |
| `404.webp` | Mobile unknown-route not-found page. |

## Known limits

These screenshots use the available staging catalog and do not establish production inventory, pricing, stock, payment readiness, or final catalog-image quality. The account flows were not submitted. Checkout and payment flows were not exercised. Confirm real catalog data and approved customer-facing copy before treating these screenshots as public launch examples.
