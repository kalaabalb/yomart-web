# Shop / Products page review

## Design and functionality

- Reworked only the catalogue page into a monochrome editorial layout: oversized Shop heading, desktop category sidebar, wide search/results toolbar, and an image-led four-column desktop grid with consistent portrait image frames and restrained borders.
- At mobile widths, the sidebar becomes a labeled native category selector. The grid becomes two columns and remains within the viewport.
- Product and category data still come from the existing API. Search continues to use the supported `search` parameter and category selection uses `category`; no pagination or brand filter was added.
- Shared product-card behavior is preserved: staging cards say “Price to be confirmed,” stock-only filtering and quick-add remain hidden in preview, and cards retain product-detail links. No product facts, ratings, discounts, or stock claims were added.
- Global navigation and the official logo were left unchanged.

## API and screenshot data

- Read-only GET checks returned HTTP 200 for `/products` and `/categories`; the API returned 8 products and 4 categories at capture time.
- The staging build uses the configured YoMart API. Its CORS policy does not include the local preview origin, so a normal local browser capture showed the API error state. Final screenshots use an isolated unauthenticated Chromium profile with `--disable-web-security` solely to render the actual public catalogue responses. No login, mutation, or customer-specific API was used; no CORS or service setting was changed.
- The preview notice remains visible and preview ordering restrictions remain active.

## Screenshots inspected

- `desktop-1440x1000.png` — 1440×1000: desktop sidebar, search, results, and four-column product grid.
- `desktop-1280x900.png` — 1280×900: sidebar and four-column grid with narrower image frames.
- `mobile-390x844.png` — 390×844: accessible category selector, search, and two-column grid.
- `mobile-360x800.png` — 360×800: compact controls and two-column grid remain within the viewport.

All images were inspected at their actual viewport dimensions. The product photos use a consistent contained crop so products are not cut off.

## Validation

- `npm test`: 51 passed, 0 failed, 0 skipped.
- Staging build: passed with API/site-origin validation and staging noindex protections.
- All screenshot dimensions match the requested sizes.
- `git diff --check`: passed.

## Remaining note

- Prices intentionally display “Price to be confirmed” in staging. The visible catalogue is a point-in-time public staging API response and is not asserted to be approved launch inventory.
