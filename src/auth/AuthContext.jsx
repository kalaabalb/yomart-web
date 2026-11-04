import { createContext, useContext, useEffect, useState } from 'react';
import { getCustomerProfile } from '../api/customer.js';
import { clearCustomerSession, getCustomerSession, setCustomerSession, subscribeCustomerSession } from './session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getCustomerSession());
  const [sessionNotice, setSessionNotice] = useState('');
  useEffect(() => subscribeCustomerSession((nextSession, reason) => {
    setSession(nextSession);
    if (reason === 'expired') setSessionNotice('Your session expired. Sign in again to continue.');
    else if (nextSession) setSessionNotice('');
  }), []);
  useEffect(() => {
    if (!session?.token) return undefined;
    const controller = new AbortController();
    getCustomerProfile({ signal: controller.signal }).then((profile) => {
      if (!controller.signal.aborted && getCustomerSession()?.token === session.token) {
        setCustomerSession(session.token, profile);
      }
    }).catch(() => {});
    return () => controller.abort();
  }, [session?.token]);
  const logout = () => clearCustomerSession('logout');
  return <AuthContext.Provider value={{ session, user: session?.user || null, logout, sessionNotice }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
