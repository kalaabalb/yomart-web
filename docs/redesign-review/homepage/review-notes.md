# Homepage artwork review

## Implementation

- Replaced the old front-facing illustration layer with `public/homepage-headphones-hero.png`, the owner-provided 1672×941 PNG. It is illustrative hero artwork only; it is not a catalog item. The existing `homepage-headphones.webp` file remains in the repository but is no longer referenced by the homepage.
- The source artwork includes the three-quarter-view black headphones, dark left-side negative space, and metallic silver curves. It is displayed full-bleed on desktop, so its image edges blend with the hero surface. The duplicate CSS silver arcs and their image-blending treatment were removed.
- Mobile uses a separate lower, right-biased crop. The hero height contracts on shorter mobile viewports so the three-part feature strip remains fully visible at 360×800. Feature descriptions were increased slightly for readability.
- Preserved the headline, supporting copy, Shop Now route, official YoMart mark, all nine desktop navigation destinations, search/account/cart behavior, API-backed catalog sections, and preview-catalog restrictions.
- Removed the decorative, non-interactive hero dots; the hero is static and no longer implies a carousel.

## Screenshot captures

Captured from the local staging build using Chromium at device scale factor 1. The live catalog was not used to add any product to the hero; preview restrictions remain enabled.

- `desktop-1440x1000.png` — 1440×1000.
- `desktop-1280x900.png` — 1280×900.
- `mobile-390x844.png` — 390×844.
- `mobile-360x800.png` — 360×800.

## Visual inspection and remaining differences

- Both desktop captures show the headphones dominant on the right, with the headline and Shop Now action clear on the left. The image’s silver sweep is integrated without a second CSS arc or a visible rectangular boundary. The feature strip overlays the lower composition without obscuring the headphone form.
- Both mobile captures use the separate crop: text remains on the left/top, the headphones sit lower and to the right, and the feature strip fits inside each viewport. At 360px the right edge of the headphone artwork is intentionally cropped to keep the subject prominent.
- The screenshots include the visible staging preview notice. No production catalog or checkout behavior is implied by these captures.
- The flat reference artwork does not include separate layers, so the original image’s curve geometry and headphone lighting cannot be adjusted independently in CSS.

## Validation

- `npm test`: 49 passed, 0 failed.
- Staging build: passed with the existing origin validation and noindex protections.
- `git diff --check`: passed.
