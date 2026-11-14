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
  assert.match(shell, /Shopping cart, \$\{itemCount\} items/);
  assert.match(styles, /\.homepage \.hero-wrap[\s\S]*?radial-gradient/);
  assert.match(styles, /\.homepage \.hero-features/);
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.homepage \.hero-stage/);
  assert.match(styles, /\.homepage \.hero-stage \{[^}]*z-index: auto/);
  assert.match(styles, /\.homepage \.hero-headphones \{[^}]*object-fit: contain/);
  assert.match(styles, /\.homepage \.hero-headphones \{[^}]*mix-blend-mode: screen/);
  assert.match(styles, /\.homepage \.hero-features \{[^}]*min-height: 78px/);
});
