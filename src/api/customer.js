import { requestJson } from './http.js';

export function loginCustomer(name, password) {
  return requestJson('/users/login', { method: 'POST', body: { name, password } });
}

export function registerCustomer({ name, email, password }) {
  return requestJson('/users/register', { method: 'POST', body: { name, email, password } });
}

export function getCustomerProfile(options = {}) {
  return requestJson('/users/profile', { ...options, authenticated: true });
}

export function getCheckoutSettings(options = {}) {
  return requestJson('/store-settings/checkout', options);
}

export function uploadPaymentProof(imageDataUrl, options = {}) {
  return requestJson('/payment/upload-proof-base64', {
    ...options,
    method: 'POST',
    body: { image: imageDataUrl },
    authenticated: true,
  });
}

export function createCustomerOrder(order, idempotencyKey, options = {}) {
  return requestJson('/orders', {
    ...options,
    method: 'POST',
    body: order,
    authenticated: true,
    headers: { ...(options.headers || {}), 'Idempotency-Key': idempotencyKey },
  });
}

export function getCustomerOrders(options = {}) {
  return requestJson('/orders', { ...options, authenticated: true });
}

export function getCustomerOrder(orderId, options = {}) {
  return requestJson(`/orders/${encodeURIComponent(orderId)}`, { ...options, authenticated: true });
}
