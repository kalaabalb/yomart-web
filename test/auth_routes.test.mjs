import test from 'node:test';
import assert from 'node:assert/strict';
import { authGateDecision, authStateForRedirect, getAuthReturnTarget, requiresCustomerSession } from '../src/auth/routes.js';

test('homepage, catalog, product details, and cart are public for first-time visitors', () => {
  for (const path of ['/', '/products', '/products/synthetic-product', '/cart']) {
    assert.equal(requiresCustomerSession(path), false, `${path} should be public`);
    assert.equal(authGateDecision(path, false), true, `guest should be able to visit ${path}`);
  }
});

test('checkout, account, orders, order details, and confirmation require a customer session', () => {
  for (const path of ['/checkout', '/account', '/orders', '/orders/synthetic-order', '/checkout/confirmation/synthetic-order']) {
    assert.equal(requiresCustomerSession(path), true, `${path} should be protected`);
    assert.equal(authGateDecision(path, false), false, `guest should be redirected from ${path}`);
    assert.equal(authGateDecision(path, true), true, `customer should reach ${path}`);
  }
});

test('checkout redirects preserve the cart and return to checkout after successful authentication', () => {
  const location = { pathname: '/checkout', search: '?step=delivery', hash: '#summary' };
  const state = authStateForRedirect(location);
  assert.equal(state.reason, 'checkout');
  assert.deepEqual(state.from, location);
  assert.equal(getAuthReturnTarget({ state }), '/checkout?step=delivery#summary');
});

test('protected-page redirects preserve intended order and account destinations', () => {
  const state = authStateForRedirect({ pathname: '/orders/synthetic-order', search: '', hash: '' });
  assert.equal(state.reason, 'protected-page');
  assert.equal(getAuthReturnTarget({ state }), '/orders/synthetic-order');
  assert.equal(getAuthReturnTarget({ state: { from: { pathname: '/account' } } }), '/account');
});

test('post-auth destinations reject external and protocol-relative redirects', () => {
  assert.equal(getAuthReturnTarget({ state: { from: 'https://attacker.invalid/' } }), '/account');
  assert.equal(getAuthReturnTarget({ state: { from: '//attacker.invalid/' } }), '/account');
  assert.equal(getAuthReturnTarget({ state: { from: { pathname: '/\\attacker.invalid' } } }), '/account');
});
