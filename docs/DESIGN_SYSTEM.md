# YoMart Storefront Design System — "Warm Editorial"

A paper-and-ink storefront: warm canvas, near-black ink, vermilion accent, deep-forest feature sections and gold highlights. Product photos are the hero; every product tile uses the same studio tone so images produced by the API's photo enhancement sit seamlessly on the page. Catalog content, prices, imagery and availability still come from the backend.

Tokens live in `src/style.css` under `:root`. The legacy token names (`--color-navy-*`, `--color-blue-*`, `--color-gold-*`) are kept and remapped (navy → ink, blue → vermilion) so cart, checkout, account and order screens inherit the look.

## Color roles
| Role | Token | Value |
| --- | --- | --- |
| Ink | `--color-navy-950` | `#17130f` |
| Paper canvas | `--color-canvas` | `#f6f1e8` |
| Surface | `--color-surface` | `#fffdf9` |
| Studio tile | `--color-studio` | `#efece6` |
| Accent (vermilion) | `--color-accent` / `--color-accent-ink` | `#e5532d` / `#9f2f08` |
| Forest | `--color-forest` / `--color-forest-deep` | `#1d3a32` / `#12261f` |
| Gold highlight | `--color-gold-300` | `#e6c982` |
| Lines | `--color-line`, `--color-line-strong` | `#e4dccd`, `#d2c7b3` |

## Type
- Display: **Fraunces** (variable, with italic accents) for headings, wordmark, collection titles.
- Body/UI: **DM Sans**. Minimum body size 15–16px; form controls are 16px to stop iOS zoom.
- Fonts load from Google Fonts with Georgia / system fallbacks (`index.html`).

## Components
- **Header:** sticky, blurs on scroll; search pill, account, cart bubble with count pop.
- **Hero:** big serif headline, offset-shadow search, category chips, arch-framed poster, floating featured product.
- **Ribbon:** category/brand marquee (pauses on hover, off for reduced motion).
- **Product card:** square studio tile, second image crossfade on hover, sale % badge, quick-add button (always visible on touch).
- **Collections:** coloured editorial cards with overlapping product thumbs.
- **Product page:** swipeable scroll-snap gallery (thumbs sync), sticky details column on desktop, sticky buy bar on phones.

## Mobile comfort
- 4-item bottom tab bar (Home, Shop, Cart, Account) with safe-area padding; replaced by the buy bar on product pages.
- 44–52px touch targets, 2-column product grid, horizontally scrolling category chips under a sticky search.
- No hover-only features: hover effects are gated by `@media (hover: hover)`.
- Breakpoints: 1100 (tablet), 900 (nav collapses), 720 (phone chrome), 380 (small phones).

## Motion
Scroll reveal (`[data-reveal]` + `useRevealOnScroll`), arch settle, floating hero accents, button press, cart-count pop, toast slide. Everything is decorative and disabled under `prefers-reduced-motion`; content is visible without JavaScript.
