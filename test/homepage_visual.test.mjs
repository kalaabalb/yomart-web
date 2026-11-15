import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('homepage hero uses monochrome illustrative artwork and preserves real shopping routes', async () => {
  const page = await readFile(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
  const shell = await readFile(new URL('../src/components/SiteShell.jsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
  const artwork = await readFile(new URL('../public/homepage-headphones-hero.png', import.meta.url));
  assert.deepEqual([...artwork.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(artwork.readUInt32BE(16), 1672);
  assert.equal(artwork.readUInt32BE(20), 941);
  assert.match(page, /Good things\./);
  assert.match(page, /Well chosen\./);
  assert.match(page, /hero-shop-button[\s\S]*?to="\/products"/);
  assert.match(page, /homepage-headphones-hero\.png/);
  assert.doesNotMatch(page, /hero-silver-arc|hero-indicators/);
  assert.doesNotMatch(page, /hero-float|hero-search|hero-panel/);
  assert.match(shell, /SHOP SMARTER\. LIVE BETTER\./);
  for (const destination of ['Home', 'Shop', 'Categories', 'Deals', 'About', 'Contact', 'Brands', 'Login', 'Register']) {
    assert.match(shell, new RegExp(`>${destination}<`));
  }
  assert.match(shell, /Shopping cart, \$\{itemCount\} items/);
  assert.match(styles, /\.homepage \.hero-artwork::after[\s\S]*?linear-gradient/);
  assert.match(styles, /\.homepage \.hero-features/);
  assert.match(styles, /\.homepage \.hero-artwork \{ position: absolute; z-index: 0; inset: 0/);
  assert.match(styles, /\.homepage \.hero-artwork img \{[^}]*object-fit: cover/);
  assert.match(styles, /@media \(min-width: 1101px\) and \(max-width: 1340px\)[\s\S]*?\.home-site-frame \.header-search \{ flex: 0 1 270px/);
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.homepage \.hero-copy > p \{ max-width: 36ch/);
  assert.match(styles, /\.homepage \.hero-shop-button \{ min-height: 48px; margin-top: 24px/);
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.homepage \.hero-artwork \{ inset: 205px/);
  assert.match(styles, /\.homepage \.hero-artwork img \{ object-position: 88% center/);
  assert.match(styles, /min-height: min\(610px, calc\(100svh - 214px\)\)/);
  assert.match(styles, /\.homepage \.hero-features \{[^}]*min-height: 100px/);
  assert.match(styles, /\.home-site-frame \.main-nav \.home-nav-auth-link \{ display: inline-flex; \}/);
  assert.match(styles, /\.homepage \.hero-features small \{[^}]*font-size: \.72rem/);
  assert.match(styles, /\.homepage \.hero-features > div:nth-child\(3\) \{ grid-column: 1 \/ -1/);
});
