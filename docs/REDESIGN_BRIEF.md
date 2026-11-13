# YoMart Web — Redesign Brief (v2)

Branch: `feat/web-blue-redesign` (starting point). Stack: React 18 + Vite, `src/style.css` tokens, no new dependencies unless asked.
Identity: navy + blue on white. **No gold, no beige/gray-yellow tints anywhere.**

## 1. Text rule (most important)
Almost no copy is hard-coded. Visible words come from the API; the UI only owns short functional labels.

- **Allowed hard-coded text:** nav links (Home, Shop, Support, Cart, Sign in), buttons (Add to cart, Search, Checkout), form labels, state messages (Loading, Out of stock, Try again), and section titles of 1–3 words (`Categories`, `New arrivals`, `Collections`, `Brands`).
- **Must come from data:** hero headline/subtitle = first poster (`posterName`, `subtitle`); collection title/subtitle; category, brand and product names; stats (counts).
- **Delete entirely:** eyebrow labels ("The YoMart catalog", "Browse", "Trusted names"…), marketing paragraphs, footer tagline, "Prices update live…" notes, "Ready when you are" CTA copy.
- If the data for a block is missing, **hide the block** instead of showing filler text.
- Never write the phrase "the YoMart catalog" in the UI. Say nothing, or use the store name only in the header/footer.
- Put every remaining string in one file (`src/content/strings.js`) so copy can be changed in one place.

## 2. Reference sites and what we take from each
**Status: these are recalled patterns, not yet checked against screenshots.** Gallery sites (Mobbin, Screens Design, Page Flows) were not reachable when this was written. When reference screenshots are added to `docs/references/`, they override this table. Take the pattern, not the look or branding.

| Reference | Take this | Use on |
| --- | --- | --- |
| Apple Store | Calm, image-led layout; lots of white space; big product photo; short labels | Home hero, product page |
| Shopify "Dawn" theme (themes.shopify.com/themes/dawn) | Clean card (image, title, price only), simple header, filter + sort drawer, quick-add | Product cards, catalog page |
| Amazon / Jumia / Noon | Compact 2-column mobile grid; strikethrough price + `-%` badge; stock cue; breadcrumb; sticky buy box | Cards, product page. Do **not** copy their density or banner clutter |
| Nike / Gymshark | Image-first grid, minimal text, fast filters as chips, large tap targets | Catalog page |
| Zara | Almost no copy, photo does the selling | Hero, category tiles |
| REI | Sticky add-to-cart bar on phones, swipeable gallery, expandable sections | Product page (mobile) |
| Glossier / Allbirds | Light, friendly UI chrome, soft hover states, rounded corners | Buttons, chips |
| Linear / Stripe (UI craft) | Subtle motion, precise spacing, focus states | Motion system |

Sources consulted: ecommerce homepage/PLP/PDP best-practice roundups (mailmodo PLP guide, mean.ceo product page examples, commercev3 store roundup). They agree on: clear price + savings, visible stock cues, few filters, sticky mobile CTA, compressed images, fast loading placeholders.

## 3. Page specs
**Header:** logo, 4–5 nav links, one search field, account, cart with count. Phone: logo, cart, menu; search below, scrolls away.

**Home**
1. Hero: if a poster exists, a full-width rounded image with the poster title/subtitle overlaid and one button; otherwise a plain search-first block with no headline. No dark box, no stats strip unless data-driven and tiny.
2. Categories: round image chips, horizontally scrollable, label under each.
3. New arrivals: product grid (4 cols desktop, 2 phone), 8 items, "View all".
4. Collections (only if data): 2–3 soft blue panels with thumbnails.
5. Brands (only if data): small logo/name row.
6. No closing banner. Footer: logo, contact links, one link.

**Catalog:** sticky search + in-stock toggle + category chips; result count; sort (price low/high, newest) if the API supports it; skeleton grid while loading; empty/error states with retry.

**Product page:** swipeable gallery (thumbs on desktop), name, price + strikethrough + saving %, stock line, description, details list, quick facts, sticky buy bar on phones, "More in {category}". Related products row (same category) if available.

**Cart / Checkout / Account / Orders:** keep logic; restyle with the same tokens; 44px+ controls.

## 3b. Information flow (what the shopper sees and decides at each step)
| Step | Shopper question | Must be visible | One tap away | Remove |
| --- | --- | --- | --- | --- |
| Home | "What do they sell?" | Search, categories, new arrivals | Any category, any product | Slogans, stats, filler banners |
| Category / Shop | "Which one?" | Photo, name, price, stock cue, discount % | Filters (drawer on phone), sort, quick-add | Descriptions, ratings the data lacks |
| Product | "Is it right, how much, can I get it?" | Gallery, price + saving, stock, Add to cart (sticky on phone) | Contact the retailer, related items | Tabs hiding key facts |
| Cart | "What am I paying?" | Items, quantity steppers, total | Remove, continue shopping, Checkout | Upsells |
| Checkout | "How do I finish fast?" | Only needed fields, order summary, payment choice, one primary button | Edit cart, sign in (guest allowed if the API supports it) | Account wall before the form |
| Confirmation / Orders | "Did it work, where is it?" | Order number, status steps, retailer contact | Order details, shop again | Dead ends |

State rules for every screen: loading = skeleton shaped like the final content; empty = one line + one action button; error = plain reason + Retry; offline = banner. Preserve cart across reload. Never lose typed form input on error. After add-to-cart, confirm inline (count pop + toast) without leaving the page.

## 4. Motion system
Use `transform`/`opacity` only. Durations 160 / 260 / 500 ms, easing `cubic-bezier(.2,.7,.2,1)`.
- Page fade-in (opacity only — do not animate `transform` on `<main>` children; it breaks fixed bars).
- Scroll reveal with stagger for cards and headings.
- Card hover: lift 4px, image zoom 1.04, second image crossfade, quick-add slides in (always visible on touch).
- Skeleton shimmer for every list; no spinners except buttons.
- Cart count pop, add-to-cart check animation, toast slide.
- Nav active underline slide; button press scale .97.
- Everything off under `prefers-reduced-motion`.

## 5. Responsive rules
Breakpoints 1100 / 900 / 720 / 380. Min tap target 44px. Inputs 16px. Safe-area padding on fixed bars. No hover-only actions. No horizontal page scroll at 320px. Test at 320, 390, 768, 1024, 1440.

## 6. Acceptance checklist
- [ ] Searching the built CSS/JSX finds no gold/yellow hex values and no `Fraunces`/`DM Sans`.
- [ ] No sentence-length marketing copy remains in JSX; all strings are in `src/content/strings.js` or come from the API.
- [ ] Every list shows a skeleton while loading and a clear empty/error state.
- [ ] Lighthouse mobile performance ≥ 85 on the home page; images lazy-loaded with width/height set.
- [ ] `npm test` and `npm run build` pass.
