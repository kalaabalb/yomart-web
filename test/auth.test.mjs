import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin, validateRegistration } from '../src/auth/validation.js';
import { clearCustomerSession, getCustomerSession, setCustomerSession, subscribeCustomerSession } from '../src/auth/session.js';
import { createJsonRequester } from '../src/api/request.js';

test('login validation requires an identifier and password', () => {
  assert.deepEqual(validateLogin({}), {
    identifier: 'Enter your username or email.',
    password: 'Enter your password.',
  });
  assert.deepEqual(validateLogin({ identifier: 'buyer@example.com', password: 'not-empty' }), {});
});

test('registration validation matches backend username, email, and password rules', () => {
  assert.deepEqual(validateRegistration({
    name: 'buyer_01',
    email: 'buyer@example.com',
    password: 'StrongPass1!',
    confirmPassword: 'StrongPass1!',
  }), {});
  assert.ok(validateRegistration({ name: 'x', email: 'bad', password: 'weak', confirmPassword: 'different' }).name);
  assert.ok(validateRegistration({ name: 'x', email: 'bad', password: 'weak', confirmPassword: 'different' }).email);
  assert.ok(validateRegistration({ name: 'x', email: 'bad', password: 'weak', confirmPassword: 'different' }).password);
  assert.ok(validateRegistration({ name: 'x', email: 'bad', password: 'weak', confirmPassword: 'different' }).confirmPassword);
});

test('customer session is memory-only, observable, and cleared on logout', () => {
  clearCustomerSession();
  const updates = [];
  const unsubscribe = subscribeCustomerSession((session) => updates.push(session));
  const session = setCustomerSession('synthetic-token', { _id: 'synthetic-user', name: 'buyer' });
  assert.equal(getCustomerSession(), session);
  clearCustomerSession();
  unsubscribe();
  assert.equal(getCustomerSession(), null);
  assert.equal(updates.length, 2);
  assert.equal(updates[1], null);
});

test('authenticated API requests send bearer token and clear session after expiry', async () => {
  clearCustomerSession();
  setCustomerSession('synthetic-token', { _id: 'synthetic-user' });
  let request;
  const requestJson = createJsonRequester('https://api.example.test', async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized.' }), { status: 401 });
  });
  await assert.rejects(requestJson('/users/profile', { authenticated: true }), (error) => error.status === 401);
  assert.equal(request.url, 'https://api.example.test/users/profile');
  assert.equal(request.options.headers.Authorization, 'Bearer synthetic-token');
  assert.equal(getCustomerSession(), null);
});

test('login failures do not clear an existing session and missing authenticated sessions fail before fetch', async () => {
  clearCustomerSession();
  setCustomerSession('synthetic-token', { _id: 'synthetic-user' });
  const requestJson = createJsonRequester('https://api.example.test', async () => new Response(JSON.stringify({ success: false, message: 'Invalid credentials.' }), { status: 401 }));
  await assert.rejects(requestJson('/users/login', { method: 'POST', body: { name: 'buyer', password: 'fake' } }), (error) => error.status === 401);
  assert.equal(getCustomerSession()?.token, 'synthetic-token');
  clearCustomerSession();
  await assert.rejects(requestJson('/users/profile', { authenticated: true }), (error) => error.status === 401);
  assert.equal(getCustomerSession(), null);
});

test('network failures use a safe message and request cancellation is preserved', async () => {
  const offlineRequest = createJsonRequester('https://api.example.test', async () => { throw new Error('raw transport detail'); });
  await assert.rejects(offlineRequest('/users/login'), (error) => error.message === 'YoMart could not reach its service. Check your connection and try again.');
  const abortedRequest = createJsonRequester('https://api.example.test', async () => { const error = new Error('aborted'); error.name = 'AbortError'; throw error; });
  await assert.rejects(abortedRequest('/users/profile'), (error) => error.name === 'AbortError');
});
