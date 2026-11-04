# YoMart Storefront Design System

The storefront uses a light editorial canvas with deep navy brand sections. Blue is reserved for actions and active navigation; muted gold marks selected premium details. Catalog content, prices, product imagery, availability, collection names, and poster copy continue to come from the backend.

Tokens are implemented in `src/style.css` under `:root`. Page styles consume those variables rather than defining page-specific color systems.

## Color roles

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Brand navy 950 | `--color-navy-950` | `#071426` | Cinematic hero, footer/strong brand text |
| Brand navy 900 | `--color-navy-900` | `#0b1b30` | Headings and dark card surfaces |
| Brand navy 800 | `--color-navy-800` | `#132a45` | Secondary structure and strong labels |
| Action blue 700 | `--color-blue-700` | `#1357b8` | Primary buttons, links, focus emphasis |
| Action blue 600 | `--color-blue-600` | `#176bdb` | Hover action state |
| Action blue 500 | `--color-blue-500` | `#3288f2` | Focus ring and input focus |
| Premium gold 700 | `--color-gold-700` | `#8c6829` | Small premium labels on light backgrounds |
| Premium gold 600 | `--color-gold-600` | `#ad853b` | Selective accent details |
| Premium gold 300 | `--color-gold-300` | `#e1c47e` | Highlights on navy surfaces |
| Canvas | `--color-canvas` | `#f4f6f9` | Main page background |
| Surface | `--color-surface` | `#ffffff` | Cards, forms, navigation |
| Muted surface | `--color-surface-muted` | `#eef2f6` | Quiet neutral treatment |
| Main text | `--color-text` | `#172a40` | Body text |
| Secondary text | `--color-text-secondary` | `#61738a` | Supporting copy |
| Muted text | `--color-text-muted` | `#5c6f85` | Helper and metadata copy |
| Borders | `--color-line`, `--color-line-strong` | `#dce3eb`, `#cbd5e1` | Separation and control boundaries |
| Success | `--color-success`, `--color-success-soft` | `#18744c`, `#e7f5ee` | In-stock and confirmed states |
| Warning | `--color-warning`, `--color-warning-soft` | `#94651c`, `#fff6e5` | Inventory and setup warnings |
| Error | `--color-error`, `--color-error-soft` | `#b63e36`, `#fff0ee` | Validation and request failures |
| Information | `--color-info`, `--color-info-soft` | `#245c9f`, `#eaf3fd` | Neutral guidance |

Semantic colors are for actual state feedback only. Gold is not used as a general-purpose action color.
On light surfaces, the muted body-copy token and gold eyebrow token were checked against the white and canvas backgrounds; both exceed 4.5:1. Primary blue buttons use white text and exceed 4.5:1 as well. This is a token-pair check, not a full automated accessibility audit of every rendered state.

## Type, layout, and rhythm

- Display family: `--font-display` (Manrope with system fallbacks); body: Inter/system UI.
- Scale: `--text-xs` through `--text-3xl`, plus responsive `--text-hero`; weights range from 400 to 800.
- Line heights: `--leading-tight` 1.08, `--leading-heading` 1.18, `--leading-body` 1.65.
- Content width: `--content-width` 1240px. Responsive gutters: `--page-gutter` clamp from 18px to 64px.
- Spacing scale: `--space-1` (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), and 24 (96px).
- Buttons: 48px standard and 40px compact. Fields: 48px.
- Radii: 8px small, 12px medium, 18px large, 24px extra large, and pill.
- Borders use the neutral line tokens. Cards use low-contrast borders and restrained shadows; hover adds lift and a slightly deeper shadow.

## Imagery and motion

- Product tiles use a square image frame; details use a large 1.1:1 frame; category marks use square thumbnails.
- Catalog images use `contain` so device edges and product proportions remain visible. Category thumbnails use `cover`.
- Missing images use the shared neutral fallback, never fabricated product artwork.
- Motion uses 160ms, 240ms, and 500ms durations with the standard/emphasized easing tokens. Motion is limited to entrances, hover lift, image scale, and the slow hero image drift.
- `prefers-reduced-motion: reduce` disables nonessential animation, transition, and smooth scrolling.

## Responsive breakpoints

- Tablet layout changes: 1040px.
- Collapsed navigation and intermediate composition: 820px.
- Mobile layout: 600px.
- Narrow-device refinements: 370px.

Navigation, catalog grids, product detail, cart, checkout, forms, account, and order views each have explicit responsive rules; mobile is not a scaled desktop grid.
