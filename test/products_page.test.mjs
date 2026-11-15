import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shop page keeps API-backed search and category filters in accessible desktop and mobile controls', async () => {
  const page = await readFile(new URL('../src/pages/ProductsPage.jsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(page, /getProducts\(\{ search, category, inStock: stockOnly \? 'true' : '' \}/);
  assert.match(page, /aria-label="Product categories"/);
  assert.match(page, /aria-pressed=\{!category\}/);
  assert.match(page, /aria-label="Filter products by category" value=\{category\}/);
  assert.match(page, /aria-label="Search products by name"/);
  assert.match(page, /\{!preview && <label className="stock-filter"/);
  assert.match(page, /<ProductGrid products=\{products\} \/>/);
  assert.match(styles, /\.catalog-page \.catalog-layout \{ display: grid; grid-template-columns: 208px/);
  assert.match(styles, /\.catalog-page \.catalog-mobile-category \{ display: none; \}/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.catalog-page \.catalog-sidebar \{ display: none; \}/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.catalog-page \.catalog-mobile-category \{[^}]*display: flex/);
});

test('shared product cards retain preview price and ordering restrictions with real detail links', async () => {
  const cards = await readFile(new URL('../src/components/CatalogCards.jsx', import.meta.url), 'utf8');
  assert.match(cards, /preview \? 'Price to be confirmed' : priceLabel\(price\)/);
  assert.match(cards, /!preview && !soldOut && <button[^>]*className=\{added \? 'quick-add is-added' : 'quick-add'\}/);
  assert.match(cards, /to=\{`\/products\/\$\{encodeURIComponent\(id\)\}`\}/);
});
