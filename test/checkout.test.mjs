import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { clearCustomerSession, setCustomerSession } from '../src/auth/session.js';
import { createJsonRequester } from '../src/api/request.js';
import { checkoutOrderBody, clearCheckoutAttempt, confirmCheckout, getStableCheckoutKey, paymentProofRequired, safePaymentLogoUrl } from '../src/checkout/checkout.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) || null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

test('checkout order body sends only item identifiers, requested quantities, address, and selected method', () => {
  assert.deepEqual(checkoutOrderBody({
    items: [{ productId: 'p1', quantity: 2, price: 0.01 }],
    shippingAddress: { phone: '555', street: 'Test', city: 'Addis' },
    paymentMethod: 'cod',
    paymentProof: { proofId: 'unused' },
  }), {
    items: [{ productID: 'p1', quantity: 2 }],
    shippingAddress: { phone: '555', street: 'Test', city: 'Addis' },
    paymentMethod: 'cod',
  });
});

test('dynamic payment method proof policy controls proof attachment without fixed provider codes', () => {
  const bank = { code: 'bank_any_name', requiresProof: true };
  const cash = { code: 'cash-at-collection', requiresProof: false };
  assert.equal(paymentProofRequired(bank), true);
  assert.equal(paymentProofRequired(cash), false);
  assert.deepEqual(checkoutOrderBody({
    items: [{ productId: 'p1', quantity: 1 }], shippingAddress: { phone: '555', city: 'City' },
    paymentMethod: bank.code, paymentProof: { proofRecordId: 'proof-123' }, requiresProof: bank.requiresProof,
  }).paymentProof, { proofRecordId: 'proof-123' });
  const body = checkoutOrderBody({
    items: [{ productId: 'p1', quantity: 1 }], shippingAddress: { phone: '555', city: 'City' },
    paymentMethod: cash.code, paymentProof: { proofRecordId: 'must-not-attach' }, requiresProof: cash.requiresProof,
  });
  assert.equal(Object.hasOwn(body, 'paymentProof'), false);
});

test('payment logos accept only credential-free HTTPS URLs', () => {
  assert.equal(safePaymentLogoUrl('https://cdn.example.test/logo.png'), 'https://cdn.example.test/logo.png');
  assert.equal(safePaymentLogoUrl('http://cdn.example.test/logo.png'), '');
  assert.equal(safePaymentLogoUrl('https://user:pass@example.test/logo.png'), '');
  assert.equal(safePaymentLogoUrl('javascript:alert(1)'), '');
});

test('secure checkout key is stable for same attempt and changes when contents change', async () => {
  const storage = memoryStorage();
  const first = await getStableCheckoutKey({ items: [{ productID: 'synthetic', quantity: 1 }] }, storage, webcrypto);
  const retry = await getStableCheckoutKey({ items: [{ productID: 'synthetic', quantity: 1 }] }, storage, webcrypto);
  const changed = await getStableCheckoutKey({ items: [{ productID: 'synthetic', quantity: 2 }] }, storage, webcrypto);
  assert.equal(first, retry);
  assert.notEqual(first, changed);
  assert.match(first, /^[0-9a-f-]{36}$/);
  clearCheckoutAttempt(storage);
  assert.equal(storage.getItem('yomart.checkout-attempt.v1'), null);
});

test('cart clears only after an order result contains an order identifier', () => {
  let clears = 0;
  assert.equal(confirmCheckout(null, () => { clears += 1; }), false);
  assert.equal(confirmCheckout({ success: true }, () => { clears += 1; }), false);
  assert.equal(clears, 0);
  assert.equal(confirmCheckout({ _id: 'synthetic-order' }, () => { clears += 1; }), true);
  assert.equal(clears, 1);
});

test('order request includes the stable idempotency header and authenticated customer token', async () => {
  clearCustomerSession();
  setCustomerSession('synthetic-token', { _id: 'synthetic-owner' });
  let captured;
  const requester = createJsonRequester('https://api.example.test', async (url, init) => {
    captured = { url, init };
    return new Response(JSON.stringify({ success: true, data: { _id: 'synthetic-order' } }), { status: 200 });
  });
  const result = await requester('/orders', {
    method: 'POST', authenticated: true,
    headers: { 'Idempotency-Key': 'synthetic-stable-key' },
    body: { items: [], paymentMethod: 'cod' },
  });
  assert.equal(result._id, 'synthetic-order');
  assert.equal(captured.init.headers['Idempotency-Key'], 'synthetic-stable-key');
  assert.equal(captured.init.headers.Authorization, 'Bearer synthetic-token');
  clearCustomerSession();
});

test('failed checkout response does not imply a cart clear or reveal a receipt URL', () => {
  let clears = 0;
  assert.equal(confirmCheckout({ success: false, message: 'retry' }, () => { clears += 1; }), false);
  assert.equal(clears, 0);
});
