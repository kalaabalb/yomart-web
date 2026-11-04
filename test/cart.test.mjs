import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCartItem,
  cartItemCount,
  estimateCartSubtotal,
  normalizeCart,
  readCart,
  removeCartItem,
  setCartQuantity,
  writeCart,
  CART_STORAGE_KEY,
} from '../src/cart/cart.js';
import { clearCustomerSession, setCustomerSession } from '../src/auth/session.js';

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
    read: () => value,
  };
}

test('cart persists only product IDs and quantities, normalizes corrupt entries, and survives malformed storage', () => {
  const storage = memoryStorage();
  const items = addCartItem([], 'product-a', 2);
  assert.equal(writeCart(items, storage), true);
  assert.equal(storage.read(), JSON.stringify([{ productId: 'product-a', quantity: 2 }]));
  assert.deepEqual(readCart(storage), items);
  assert.equal(storage.read().includes('price'), false);
  assert.deepEqual(normalizeCart([{ productId: 'ok', quantity: 2 }, { productId: '', quantity: 1 }, { productId: 'bad', quantity: -2 }]), [{ productId: 'ok', quantity: 2 }]);
  assert.deepEqual(readCart(memoryStorage('{broken')), []);
  assert.equal(CART_STORAGE_KEY, 'yomart.customer-cart.v1');
});

test('cart add, quantity update, remove, item count, and limits behave predictably', () => {
  let items = addCartItem([], 'p1');
  items = addCartItem(items, 'p1', 2);
  items = addCartItem(items, 'p2');
  assert.deepEqual(items, [{ productId: 'p1', quantity: 3 }, { productId: 'p2', quantity: 1 }]);
  assert.equal(cartItemCount(items), 4);
  assert.deepEqual(setCartQuantity(items, 'p1', 5)[0], { productId: 'p1', quantity: 5 });
  assert.deepEqual(removeCartItem(items, 'p1'), [{ productId: 'p2', quantity: 1 }]);
  assert.throws(() => addCartItem([{ productId: 'p1', quantity: 100 }], 'p1'), /up to 100/);
  assert.throws(() => setCartQuantity(items, 'p1', 101), /between 1 and 100/);
  assert.throws(() => addCartItem([], '', 1), /valid product/);
});

test('cart estimate reads current API prices and applies a valid offer price', () => {
  const items = [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 1 }];
  const products = new Map([
    ['p1', { price: 100, offerPrice: 80 }],
    ['p2', { price: 40, offerPrice: 50 }],
  ]);
  assert.equal(estimateCartSubtotal(items, products), 200);
  assert.equal(estimateCartSubtotal(items, new Map()), 0);
});

test('cart storage failure is reported without throwing', () => {
  const storage = { getItem() { throw new Error('unavailable'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(readCart(storage), []);
  assert.equal(writeCart([], storage), false);
});

test('guest cart survives sign-in and logout transitions', () => {
  const storage = memoryStorage();
  const guestCart = addCartItem([], 'guest-product', 2);
  writeCart(guestCart, storage);
  setCustomerSession('synthetic-token', { _id: 'synthetic-customer' });
  assert.deepEqual(readCart(storage), guestCart);
  clearCustomerSession();
  assert.deepEqual(readCart(storage), guestCart);
});
