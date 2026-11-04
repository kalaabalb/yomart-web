import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addCartItem, cartItemCount, readCart, removeCartItem, setCartQuantity, writeCart } from './cart.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!writeCart(items)) setNotice('Your browser could not save the cart on this device.');
  }, [items]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function addProduct(product) {
    const id = String(product?._id || product?.id || '');
    const knownStock = product?.quantity !== null && product?.quantity !== undefined && Number.isFinite(Number(product.quantity));
    if (knownStock && Number(product.quantity) < 1) {
      setNotice('This product is currently out of stock.');
      return false;
    }
    try {
      const next = addCartItem(items, id);
      if (knownStock && next.find((item) => item.productId === id)?.quantity > Number(product.quantity)) {
        throw new Error('The cart quantity is above the latest available stock.');
      }
      setItems(next);
      setNotice(`${product.name || 'Product'} added to your cart.`);
      return true;
    } catch (error) {
      setNotice(error.message);
      return false;
    }
  }

  function updateQuantity(productId, quantity) {
    try {
      setItems(setCartQuantity(items, productId, quantity));
      return true;
    } catch (error) {
      setNotice(error.message);
      return false;
    }
  }

  function removeProduct(productId) {
    setItems(removeCartItem(items, productId));
    setNotice('Product removed from your cart.');
  }

  function clearCart() {
    setItems([]);
    setNotice('Your order was confirmed. Your cart is now clear.');
  }

  const value = useMemo(() => ({ items, itemCount: cartItemCount(items), notice, addProduct, updateQuantity, removeProduct, clearCart }), [items, notice]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
