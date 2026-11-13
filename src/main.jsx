import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SiteShell } from './components/SiteShell.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import { CartProvider } from './cart/CartContext.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { deployment } from './config/runtime.js';
import { authGateDecision, authStateForRedirect } from './auth/routes.js';
import { useAuth } from './auth/AuthContext.jsx';
import './style.css';

function NotFound() {
  return <div className="not-found page-wrap"><span className="eyebrow">Page not found</span><h1>This page isn’t in the catalog.</h1><Link className="button button-primary" to="/">Return home</Link></div>;
}

function RequireCustomerSession({ children }) {
  const { session } = useAuth();
  const location = useLocation();
  if (authGateDecision(location.pathname, Boolean(session?.token && session?.user))) return children;
  return <Navigate to="/login" replace state={authStateForRedirect(location)} />;
}

function App() {
  document.documentElement.dataset.siteOrigin = deployment.siteOrigin;
  const protect = (element) => <RequireCustomerSession>{element}</RequireCustomerSession>;
  return <BrowserRouter><AuthProvider><CartProvider><SiteShell><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductPage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={protect(<CheckoutPage />)} />
    <Route path="/checkout/confirmation/:id" element={protect(<OrderConfirmationPage />)} />
    <Route path="/orders" element={protect(<OrdersPage />)} />
    <Route path="/orders/:id" element={protect(<OrderDetailsPage />)} />
    <Route path="/account" element={protect(<AccountPage />)} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes></SiteShell></CartProvider></AuthProvider></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
