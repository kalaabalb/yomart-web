import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductsPath, catalogImageUrl, priceLabel, productId, unwrapList } from '../src/api/contract.js';

test('product list query uses only existing API filters and encodes values', () => {
  assert.equal(buildProductsPath({ search: 'iPhone 16', category: 'a/b', inStock: 'true' }), '/products?search=iPhone+16&category=a%2Fb&inStock=true');
  assert.equal(buildProductsPath({}), '/products');
});

test('response adapter reads backend data envelope without inventing items', () => {
  const items = [{ _id: 'catalog-id' }];
  assert.equal(unwrapList({ success: true, data: items }), items);
  assert.deepEqual(unwrapList({ success: false, data: null }), []);
  assert.deepEqual(unwrapList({ data: { items } }), items);
});

test('catalog identifiers and media use API data and reject unsafe image schemes', () => {
  assert.equal(productId({ _id: 'abc' }), 'abc');
  assert.equal(catalogImageUrl('/uploads/catalog/item.webp', 'https://api.example.test'), 'https://api.example.test/uploads/catalog/item.webp');
  assert.equal(catalogImageUrl('//other.example/item.webp', 'https://api.example.test'), '');
  assert.equal(catalogImageUrl('javascript:alert(1)', 'https://api.example.test'), '');
});

test('price label is based on a finite API amount and uses current app convention', () => {
  assert.equal(priceLabel(1200), 'Birr 1,200');
  assert.equal(priceLabel('not-a-price'), 'Price unavailable');
  assert.equal(priceLabel(null), 'Price unavailable');
});
