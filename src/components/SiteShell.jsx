import { ArrowRight, LogOut, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useRevealOnScroll } from '../hooks.js';
import { RetailerContacts } from './RetailerContacts.jsx';

export function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, notice } = useCart();
  const { user, logout } = useAuth();
  useRevealOnScroll(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Route changes start at the top; in-page navigation lands on its section.
  useEffect(() => {
    setMenuOpen(false);
    if (location.hash) {
      window.requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/products${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
    setMenuOpen(false);
  }
  const count = itemCount > 99 ? '99+' : itemCount;

  return <div className="site-frame">
    <div className="announcement"><span className="announcement-dot" aria-hidden="true" /> Explore the YoMart catalog <ArrowRight size={13} aria-hidden="true" /></div>
    <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}>
      <Link className="wordmark" to="/" aria-label="YoMart home"><img src="/yomart_gold_mark.png" alt="" /><span>YoMart</span></Link>
      <nav id="main-navigation" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products">Shop</NavLink>
        <NavLink to="/support">Support</NavLink>
        {user && <NavLink to="/orders">Orders</NavLink>}
        {user && <NavLink to="/account">Account</NavLink>}
        <Link to="/#categories" onClick={() => setMenuOpen(false)}>Categories</Link>
        <Link to="/#brands" onClick={() => setMenuOpen(false)}>Brands</Link>
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register">Register</NavLink>}
        {user && <button className="nav-logout" type="button" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>Sign out <LogOut size={16} /></button>}
      </nav>
      <form className="header-search" onSubmit={submitSearch} role="search">
        <Search size={17} aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products by name" enterKeyHint="search" />
        <button aria-label="Submit search"><ArrowRight size={16} /></button>
      </form>
      <Link className="account-link" to={user ? '/account' : '/login'} aria-label={user ? `Account for ${user.name}` : 'Sign in or create an account'}><UserRound size={19} /><span>{user ? 'Account' : 'Sign in'}</span></Link>
      <Link className="bag-link" to="/cart" aria-label={`Shopping cart, ${itemCount} items`}><ShoppingBag size={20} />{itemCount > 0 && <span className="cart-count" key={itemCount}>{count}</span>}</Link>
      <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </header>
    {notice && <div className="cart-toast" role="status">{notice}</div>}
    <main className="route-stage">{children}</main>
    <footer className="site-footer">
      <div className="footer-brand"><img src="/yomart_gold_mark.png" alt="" /><div><strong>YoMart</strong><span>Thoughtful finds, clearly presented.</span></div></div>
      <RetailerContacts placement="storefront_footer" className="footer-contacts" />
      <p>Product details, prices and availability come straight from the YoMart catalog.</p>
      <Link to="/products">Explore the catalog <ArrowRight size={16} /></Link>
    </footer>
  </div>;
}
