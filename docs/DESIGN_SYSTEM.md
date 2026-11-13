# YoMart Premium Storefront Design System

The customer storefront now uses a monochrome electronics-retail direction: deep ink gives the brand structure, white and soft silver surfaces frame real catalog content, and restrained motion adds depth. The official YoMart logo and existing favicon assets remain the source of brand marks. Product names, photos, prices, categories, collections, brands, stock and poster copy continue to come from the public API; there is no bundled demo catalog.

## Color tokens

Tokens are implemented in `src/style.css`. Legacy `--color-navy-*`, `--color-blue-*`, and `--color-gold-*` names remain as compatibility aliases for existing commerce components. Their rendered roles are monochrome.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Primary ink | `--color-navy-950` | `#111214` | Header, hero, primary buttons, strong text |
| Secondary ink | `--color-navy-900` | `#26282b` | Headings and dark surfaces |
| Muted ink | `--color-navy-800`, `--color-text-secondary` | `#3a3d41`, `#4b4e52` | Navigation and supporting text |
| Silver | `--color-gold-700`, `--color-gold-600`, `--color-gold-300` | `#575b60`, `#777c82`, `#d3d5d8` | Quiet accents, borders, dark-surface details |
| Canvas | `--color-canvas` | `#fafafa` | Page background |
| Surface | `--color-surface` | `#ffffff` | Product, cart, form and summary cards |
| Muted surface | `--color-surface-muted`, `--color-studio` | `#eff0f1` | Product-image backgrounds and quiet controls |
| Main/muted text | `--color-text`, `--color-text-muted` | `#18191b`, `#62666b` | Body and secondary copy |
| Borders | `--color-line`, `--color-line-strong` | `#e1e2e4`, `#c9cbce` | Separation and control edges |
| Success | `--color-success`, `--color-success-soft` | `#216846`, `#e7f3ec` | Actual positive states only |
| Warning | `--color-warning`, `--color-warning-soft` | `#76531b`, `#f7f0e2` | Actual warnings only |
| Error | `--color-error`, `--color-error-soft` | `#9b302b`, `#faeceb` | Actual errors only |
| Information | `--color-info`, `--color-info-soft` | `#3f5368`, `#edf1f5` | Neutral guidance |

Primary actions are black with white text. Semantic colors are reserved for corresponding feedback. Sale red is used only for an actual sale badge supplied by product data.

## Type, grid and spacing

- Display: Manrope with system fallbacks; body: Inter with system fallbacks.
- Type scale: `--text-xs` `.8125rem`, `--text-sm` `.9375rem`, `--text-md` `1rem`; headings scale responsively with `clamp()`.
- Weights: 400, 500, 600, 700 and 800. Body line-height is 1.65; compact display headings use approximately 1.04–1.16.
- Content width: `--content-width: 1320px`; gutters use `clamp(18px, 4vw, 62px)`.
- Spacing tokens: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 and 80px.
- Buttons and fields: 48px default, 40px compact; radii: 7, 11, 16 and 22px plus pill.
- Borders use silver neutrals. Shadows are low-contrast at rest and slightly deeper on hover.

## Imagery and motion

- Product cards use square image frames; product details use a square gallery with swipe and thumbnail controls; category images use square crops.
- Product images use API-backed assets and shared fallback UI when missing. The hero uses the current API poster or product image and an empty YoMart mark fallback; it does not invent catalog photography.
- Motion uses 150ms, 240ms and 520ms timing tokens. It is limited to route entrance, section reveal, restrained image scale, and hover/focus feedback. `prefers-reduced-motion` disables nonessential hero motion and existing reduced-motion rules cover the rest.
- Keyboard focus remains visibly outlined. Hover-revealed quick actions remain keyboard focusable.

## Responsive layouts

- Tablet/navigation compression: 1100px and 900px.
- Mobile composition and menu: 720px.
- Small-screen control adjustments: 380px.

Hero, product grid, gallery, checkout summary, forms, cart and navigation use dedicated responsive rules; mobile layouts are not a uniformly shrunken desktop grid.

## Content and safety rules

- All catalog information and customer contacts are loaded from the backend.
- The storefront does not bundle mock products or use fake prices, stock counts, discounts or business claims.
- Staging/local builds stay `noindex`; the admin application remains independently noindex.
- Payment-proof URLs and customer order data are not included in public catalog sections or screenshots.
