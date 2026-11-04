export const CHECKOUT_ATTEMPT_KEY = 'yomart.checkout-attempt.v1';

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function getStableCheckoutKey(payload, storage = globalThis.sessionStorage, cryptoApi = globalThis.crypto) {
  if (!storage || !cryptoApi?.subtle || !cryptoApi?.getRandomValues) {
    throw new Error('Secure checkout retry support is unavailable in this browser.');
  }
  const serialized = stableJson(payload);
  const digest = toHex(await cryptoApi.subtle.digest('SHA-256', new TextEncoder().encode(serialized)));
  let current;
  try { current = JSON.parse(storage.getItem(CHECKOUT_ATTEMPT_KEY) || 'null'); } catch { current = null; }
  if (current?.digest === digest && typeof current.key === 'string') return current.key;
  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = toHex(bytes);
  const key = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  storage.setItem(CHECKOUT_ATTEMPT_KEY, JSON.stringify({ digest, key }));
  return key;
}

export function clearCheckoutAttempt(storage = globalThis.sessionStorage) {
  try { storage?.removeItem(CHECKOUT_ATTEMPT_KEY); } catch { /* storage may be disabled */ }
}

export function isConfirmedOrder(order) {
  return Boolean(order && typeof order === 'object' && (order._id || order.id));
}

export function confirmCheckout(order, clearCart) {
  if (!isConfirmedOrder(order)) return false;
  clearCart();
  return true;
}

export function paymentProofRequired(method) {
  if (typeof method?.requiresProof === 'boolean') return method.requiresProof;
  return Boolean(method?.code && method.code !== 'cod');
}

export function safePaymentLogoUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function checkoutOrderBody({ items, shippingAddress, paymentMethod, paymentProof, requiresProof = paymentMethod !== 'cod' }) {
  return {
    items: items.map(({ productId, quantity }) => ({ productID: productId, quantity })),
    shippingAddress,
    paymentMethod,
    ...(requiresProof ? {
      paymentProof: paymentProof?.proofRecordId
        ? { proofRecordId: paymentProof.proofRecordId }
        : null,
    } : {}),
  };
}
