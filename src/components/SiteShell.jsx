import { ArrowRight, LogOut, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { RetailerContacts } from './RetailerContacts.jsx';

export function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { itemCount, notice } = useCart();
  const { user, logout } = useAuth();
  function submitSearch(event) {
    event.preventDefault();
    navigate(`/products${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
    setMenuOpen(false);
  }

  return <div className="site-frame">
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="YoMart home"><img src="/yomart_gold_mark.png" alt="" /><span>YoMart</span></Link>
      <nav id="main-navigation" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/products" onClick={() => setMenuOpen(false)}>Shop</NavLink>
        <NavLink to="/support" onClick={() => setMenuOpen(false)}>Support</NavLink>
        {user && <NavLink to="/orders" onClick={() => setMenuOpen(false)}>Orders</NavLink>}
        {user && <NavLink to="/account" onClick={() => setMenuOpen(false)}>Account</NavLink>}
        <a href="/#categories" onClick={() => setMenuOpen(false)}>Categories</a>
        <a href="/#brands" onClick={() => setMenuOpen(false)}>Brands</a>
        {!user && <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>}
        {!user && <NavLink to="/register" onClick={() => setMenuOpen(false)}>Register</NavLink>}
        {user && <button className="nav-logout" type="button" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>Sign out <LogOut size={14} /></button>}
      </nav>
      <form className="header-search" onSubmit={submitSearch} role="search">
        <Search size={16} aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products by name" />
        <button aria-label="Submit search"><ArrowRight size={15} /></button>
      </form>
      <Link className="account-link" to={user ? '/account' : '/login'} aria-label={user ? `Account for ${user.name}` : 'Sign in or create an account'}><UserRound size={18} /><span>{user ? 'Account' : 'Sign in'}</span></Link>
      <Link className="bag-link" to="/cart" aria-label={`Shopping cart, ${itemCount} items`}><ShoppingBag size={19} />{itemCount > 0 && <span className="cart-count">{itemCount > 99 ? '99+' : itemCount}</span>}</Link>
      <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    {notice && <div className="cart-toast" role="status">{notice}</div>}
    <main>{children}</main>
    <footer className="site-footer">
      <div className="footer-brand"><img src="/yomart_gold_mark.png" alt="" /><div><strong>YoMart</strong></div></div>
      <RetailerContacts placement="storefront_footer" className="footer-contacts" />
      <p>Product details and availability are provided by the YoMart catalog.</p>
      <Link to="/products">Explore the catalog <ArrowRight size={14} /></Link>
    </footer>
  </div>;
}
