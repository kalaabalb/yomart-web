# YoMart Storefront

React customer storefront for the YoMart marketplace.

## Deployment

- Customer storefront: https://yomart.onrender.com
- API: https://yomart-api.onrender.com
- The static site remains a staging/noindex preview build; the API it calls is the production API.
- Live desktop/mobile screenshots and direct-route smoke checks run in GitHub Actions.

## Preview catalogue behavior

The active API database has 8 active synthetic review products. Prices and stock are not owner-approved retail offers.

While the build target is not production, the storefront:
- Shows a clear preview-catalogue notice.
- Hides all illustrative prices and stock indicators.
- Shows “Price to be confirmed” on product cards/details/cart.
- Hides the stock-only filter.
- Disables add-to-cart and checkout.
- Displays a non-submittable preview checkout message.
- Keeps browsing, search, categories, product images and collections available.

The API independently fails closed for order creation and omits `price`, `offerPrice`, and `quantity` from public product-list/detail responses while `YOMART_SALES_ENABLED=false`. Authenticated admin product responses retain those fields.

## Payment and support

The only enabled payment method is **Cash at shop or handover**. Customers pay at shop pickup or directly to YoMart staff when they hand over the order. No online payment gateway or bank/wallet method is configured. Customer-facing support contact records are currently empty and must be provided by the owner before launch.

## Privacy and account deletion

- Privacy policy draft: https://yomart.onrender.com/privacy-policy.html (noindex; owner/legal details still required; not approved for Play Console).
- External account deletion: https://yomart.onrender.com/account-deletion.html (noindex draft, wired to the production account-deletion API).
- The policy still contains publisher/support placeholders. Do not submit it to Google Play until the owner supplies the legal publisher name, monitored support email, public contact details and approved retention wording.

## Visual evidence

The latest CI run also executes real Playwright navigation checks: home → catalog → product detail, preview price/stock masking, disabled add-to-cart, cart, login, support, privacy/account-deletion drafts and admin sign-in. Its screenshot artifact contains genuine 1440x1100 desktop and 390x844 mobile captures for those routes. It is available from the [storefront Actions workflow](https://github.com/kalaabalb/yomart-web/actions).

The checked-in [redesign review set](docs/redesign-review/README.md) contains additional local Chromium screenshots at 1440×1000 desktop and 390×844 mobile sizes. They use only read-only staging API catalog data and clearly document preview-data limitations; they are not production inventory or store-listing artwork.

See the [launch readiness checklist](https://github.com/kalaabalb/yomart-docs/blob/main/docs/launch/readiness.md) before enabling sales or indexing the storefront.
