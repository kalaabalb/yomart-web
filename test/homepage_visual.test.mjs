import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('homepage hero uses monochrome illustrative artwork and preserves real shopping routes', async () => {
  const page = await readFile(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
  const shell = await readFile(new URL('../src/components/SiteShell.jsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(page, /Good things\./);
  assert.match(page, /Well chosen\./);
  assert.match(page, /hero-shop-button[\s\S]*?to="\/products"/);
  assert.match(page, /homepage-headphones\.webp/);
  assert.doesNotMatch(page, /hero-float|hero-search|hero-panel/);
  assert.match(shell, /SHOP SMARTER\. LIVE BETTER\./);
  for (const destination of ['Home', 'Shop', 'Categories', 'Deals', 'About', 'Contact', 'Brands', 'Login', 'Register']) {
    assert.match(shell, new RegExp(`>${destination}<`));
  }
  assert.match(shell, /Shopping cart, \$\{itemCount\} items/);
  assert.match(styles, /\.homepage \.hero-wrap[\s\S]*?radial-gradient/);
  assert.match(styles, /\.homepage \.hero-features/);
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.homepage \.hero-stage/);
  assert.match(styles, /\.homepage \.hero-stage \{[^}]*z-index: auto/);
  assert.match(styles, /\.homepage \.hero-headphones \{[^}]*object-fit: contain/);
  assert.match(styles, /\.homepage \.hero-headphones \{[^}]*mix-blend-mode: screen/);
  assert.match(styles, /\.homepage \.hero-features \{[^}]*min-height: 100px/);
  assert.match(styles, /\.homepage \.hero-silver-arc-one \{[^}]*border-top: 2px solid/);
  assert.match(styles, /\.homepage \.hero-silver-arc-one \{[^}]*z-index: 3/);
  assert.match(styles, /\.home-site-frame \.main-nav \.home-nav-auth-link \{ display: inline-flex; \}/);
  assert.match(styles, /\.homepage \.hero-features small \{[^}]*font-size: \.67rem/);
  assert.match(styles, /\.homepage \.hero-features > div:nth-child\(3\) \{ grid-column: 1 \/ -1/);
});
