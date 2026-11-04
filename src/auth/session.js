let activeSession = null;
const listeners = new Set();

export function getCustomerSession() {
  return activeSession;
}

export function setCustomerSession(token, user) {
  if (typeof token !== 'string' || !token || !user || typeof user !== 'object') {
    throw new Error('The sign-in response was incomplete. Please try again.');
  }
  activeSession = Object.freeze({ token, user });
  listeners.forEach((listener) => listener(activeSession, null));
  return activeSession;
}

export function clearCustomerSession(reason = 'logout') {
  activeSession = null;
  listeners.forEach((listener) => listener(activeSession, reason));
}

export function subscribeCustomerSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
