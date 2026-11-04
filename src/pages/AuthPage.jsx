import { ArrowRight, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginCustomer, registerCustomer } from '../api/customer.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getAuthReturnTarget } from '../auth/routes.js';
import { setCustomerSession } from '../auth/session.js';
import { validateLogin, validateRegistration } from '../auth/validation.js';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, sessionNotice } = useAuth();
  const mode = location.pathname === '/register' ? 'register' : 'login';
  const [values, setValues] = useState({ identifier: '', name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(location.state?.notice || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate(getAuthReturnTarget(location), { replace: true });
  }, [session, location, navigate]);

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    const validation = mode === 'login' ? validateLogin(values) : validateRegistration(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    try {
      const result = mode === 'login'
        ? await loginCustomer(values.identifier.trim(), values.password)
        : await registerCustomer({ name: values.name.trim().toLowerCase(), email: values.email.trim().toLowerCase(), password: values.password });
      setCustomerSession(result?.token, result?.user);
      navigate(getAuthReturnTarget(location), { replace: true });
    } catch (error) {
      setMessage(error.message || 'We could not complete sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (session) return null;

  const checkoutIntent = location.state?.reason === 'checkout' ||
    location.state?.from?.pathname === '/checkout' || location.state?.from === '/checkout';
  const protectedIntent = Boolean(location.state?.from);
  return <div className="page-wrap account-page auth-page">
    <section className="account-card">
      <div className="account-icon"><UserRound size={23} /></div>
      <span className="eyebrow">YoMart customer account</span>
      <h1>{mode === 'login' ? <>Welcome <em>back.</em></> : <>Create your <em>account.</em></>}</h1>
      <p>{checkoutIntent
        ? 'An account is required to place an order. Your cart is saved while you sign in or register.'
        : protectedIntent
          ? 'Sign in or create an account to continue to the page you requested.'
          : mode === 'login' ? 'Sign in to your customer account.' : 'Create an account to continue with YoMart.'}</p>
      {(sessionNotice || message) && <div className="form-message form-message-error" role="alert">{message || sessionNotice}</div>}
      <form className="account-form" onSubmit={submit} noValidate>
        {mode === 'register' ? <>
          <label>Username<input autoComplete="username" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} aria-invalid={Boolean(errors.name)} />{errors.name && <small>{errors.name}</small>}</label>
          <label>Email address<input type="email" autoComplete="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} aria-invalid={Boolean(errors.email)} />{errors.email && <small>{errors.email}</small>}</label>
        </> : <label>Username or email<input autoComplete="username" value={values.identifier} onChange={(event) => setValues({ ...values, identifier: event.target.value })} aria-invalid={Boolean(errors.identifier)} />{errors.identifier && <small>{errors.identifier}</small>}</label>}
        <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} aria-invalid={Boolean(errors.password)} />{errors.password && <small>{errors.password}</small>}</label>
        {mode === 'register' && <label>Confirm password<input type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })} aria-invalid={Boolean(errors.confirmPassword)} />{errors.confirmPassword && <small>{errors.confirmPassword}</small>}</label>}
        <button className="button button-primary account-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button>
      </form>
      <Link className="account-mode-switch" to={mode === 'login' ? '/register' : '/login'} state={location.state}>
        {mode === 'login' ? 'New to YoMart? Create an account' : 'Already have an account? Sign in'}
      </Link>
      <p className="account-limitation">Your cart stays on this device. Password recovery and email verification are not currently available.</p>
    </section>
  </div>;
}
