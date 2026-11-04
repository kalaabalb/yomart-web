const AUTH_RETURN_FALLBACK = '/account';

export function requiresCustomerSession(pathname = '/') {
  return pathname === '/checkout' ||
    pathname === '/account' ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/') ||
    pathname.startsWith('/checkout/confirmation/');
}

export function authGateDecision(pathname, isAuthenticated) {
  return !requiresCustomerSession(pathname) || Boolean(isAuthenticated);
}

function safeInternalTarget(target) {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return null;
  try {
    const parsed = new URL(target, 'https://yomart.invalid');
    if (parsed.origin !== 'https://yomart.invalid') return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function getAuthReturnTarget(location) {
  const from = location?.state?.from;
  if (typeof from === 'string') return safeInternalTarget(from) || AUTH_RETURN_FALLBACK;
  if (!from || typeof from !== 'object') return AUTH_RETURN_FALLBACK;
  const pathname = safeInternalTarget(`${from.pathname || '/'}${from.search || ''}${from.hash || ''}`);
  return pathname || AUTH_RETURN_FALLBACK;
}

export function authStateForRedirect(location) {
  const pathname = location?.pathname || '/';
  return {
    from: {
      pathname,
      search: location?.search || '',
      hash: location?.hash || '',
    },
    reason: pathname === '/checkout' ? 'checkout' : 'protected-page',
  };
}
