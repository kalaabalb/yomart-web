# Independent homepage review — commit bb00016

Review basis: the three committed browser screenshots at 1440×1000, 1280×900, and 390×844, plus the current `HomePage.jsx` and homepage-specific CSS. This is a visual/implementation review, not a pixel-perfect comparison: the original approved standalone reference is still absent from `docs/design-reference/`.

## What is now working

- The desktop header is monochrome and includes all nine expected destinations: Home, Shop, Categories, Deals, About, Contact, Brands, Login, Register.
- The homepage headline, supporting copy, Shop Now action, indicators, and three-part feature strip are present.
- The large silver foreground sweep now exists and overlaps the lower headphone artwork.
- The old hard rectangular photo edge is no longer obvious in the desktop captures.
- The mobile feature strip is fully visible in the 390×844 capture, using two columns plus a full-width third item.
- The hero image is explicitly illustrative; the catalogue remains API-driven and the preview notice remains visible.

## Remaining issues visible in the committed captures

### 1. The headphone composition is still not the approved art direction

The current asset is front-facing. CSS scaling/rotation cannot turn it into the angled studio product composition from the approved reference. The current image also has a large dark internal field, which reads as a photographic backdrop rather than a clean cut-out product integrated into the scene.

**Recommendation:** replace only the illustrative hero asset with a properly licensed angled three-quarter headphone image, ideally with transparent background or a controlled dark studio background. Do not use a catalog item unless it is genuinely in the catalog. Keep the image attribution/license record alongside the asset. Do not attempt to solve the angle mismatch with more transforms.

### 2. Desktop silver sweep is visually too dominant

At both desktop widths, the upper edge of the sweep rises across the lower earcups and obscures a substantial portion of the headphones. The approved concept uses the silver sweep as a foreground accent, but the product should remain the dominant visual.

**Recommendation:** lower the arc's top edge by approximately 6–10% of the hero height at desktop, or reduce the arc height while preserving its broad diagonal curve. Keep the thin bright edge. Check that the feature strip remains visually separate from the silver surface.

### 3. Mobile artwork competes with the copy

At 390px, the headphones begin behind the supporting paragraph and extend down the right side. Although the text remains legible, the product overlaps the text region and feels crowded. The mobile screenshot is a distinct composition, not simply a smaller desktop hero.

**Recommendation:** move the headphone stage farther down and toward the right, reduce its scale modestly, and reserve a clear text-safe area around the headline, description, and Shop Now button. Keep the silver curve behind the feature strip rather than letting it collide with the copy. Recheck at 360px as well as 390px.

### 4. Desktop header density needs a small refinement

The 1440px header fits all destinations, but navigation labels are quite small and the search field occupies a large share of the remaining width. At 1280px the header becomes more compressed.

**Recommendation:** preserve all nine links. Reduce search max-width slightly and allocate a little more width to the nav labels; do not hide destinations at desktop widths. Validate the header at 1280px and 1440px.

### 5. The carousel indicators are decorative

The three indicators are currently rendered as non-interactive `i` elements with `aria-hidden`. If the hero is intended to be a static composition, remove the suggestion of a carousel. If it is intended to be a carousel, implement actual accessible controls and real slides. Do not leave controls that imply behavior but do nothing.

## Engineering observations

- The component keeps product/category/brand/collection sections API-backed. The screenshots show an API-unavailable state, so they do not validate the successful-data presentation.
- The homepage-only header styling is applied through the homepage shell class; regression-check non-home routes because `SiteShell` and global CSS were previously touched.
- The global stylesheet contains legacy color token names whose values have been remapped to monochrome. This is broader than homepage-only styling and should be regression-tested on product, cart, checkout, and account routes.
- The screenshot report records 49 passing tests and a successful staging build. Those are useful checks, but tests do not establish visual acceptance.

## Acceptance checklist

- [ ] Original approved standalone reference stored at `docs/design-reference/homepage-approved.png`.
- [ ] Angled headphone asset replaces the front-facing asset and has documented licensing/attribution.
- [ ] Desktop silver sweep no longer obscures too much of the product.
- [ ] Mobile text-safe area is clear at 390px and 360px.
- [ ] Desktop header remains readable at 1280px and 1440px with all destinations visible.
- [ ] Carousel indicators either perform a real accessible action or are removed.
- [ ] Successful API-data state and API-error state are both checked.
- [ ] Product, cart, checkout, and account routes are regression-checked.
- [ ] Fresh desktop/mobile screenshots reviewed before approval.

## Scope

This report does not modify application code, approve a merge, or authorize deployment. Keep the separate event-update/change-stream work out of this branch.
