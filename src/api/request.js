import { clearCustomerSession, getCustomerSession } from '../auth/session.js';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function createJsonRequester(apiOrigin, fetchImpl = (...args) => globalThis.fetch(...args)) {
  return async function requestJson(path, { signal, method = 'GET', body, authenticated = false, headers: extraHeaders = {} } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (authenticated) {
      const token = getCustomerSession()?.token;
      if (!token) throw new ApiError('Sign in to continue.', 401);
      headers.Authorization = `Bearer ${token}`;
    }
    for (const [name, value] of Object.entries(extraHeaders)) {
      if (typeof value === 'string' && value) headers[name] = value;
    }

    let response;
    try {
      response = await fetchImpl(`${apiOrigin}${path}`, {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new ApiError('YoMart could not reach its service. Check your connection and try again.');
    }
    let payload;
    try { payload = await response.json(); } catch { payload = null; }
    if (response.status === 401 && authenticated) clearCustomerSession('expired');
    if (!response.ok || payload?.success === false) {
      throw new ApiError(payload?.message || `The request failed (${response.status}).`, response.status);
    }
    return payload?.data;
  };
}
