import { ArrowRight, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate('/login', { replace: true, state: { notice: 'You are signed out of this tab.' } });
  }

  return <div className="page-wrap account-page">
    <section className="account-card">
      <div className="account-icon"><UserRound size={23} /></div>
      <span className="eyebrow">YoMart account</span>
      <h1>Welcome, <em>{user?.name || 'customer'}</em></h1>
      <p>{user?.email}</p>
      <div className="session-note"><ShieldCheck size={17} /><span>Your sign-in is kept in memory for this tab and clears when the page is reloaded.</span></div>
      <Link className="button button-primary account-orders-link" to="/orders">View your orders <ArrowRight size={16} /></Link>
      <button className="button button-ghost account-logout" type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
    </section>
  </div>;
}
