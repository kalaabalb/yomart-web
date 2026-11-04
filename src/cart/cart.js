export const CART_STORAGE_KEY = 'yomart.customer-cart.v1';
export const MAX_CART_LINES = 50;
export const MAX_ITEM_QUANTITY = 100;

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const merged = new Map();
  for (const entry of value) {
    const id = typeof entry?.productId === 'string' ? entry.productId.trim() : '';
    const quantity = Number(entry?.quantity);
    if (!id || id.length > 100 || !Number.isInteger(quantity) || quantity < 1) continue;
    merged.set(id, Math.min(MAX_ITEM_QUANTITY, (merged.get(id) || 0) + quantity));
  }
  return [...merged].slice(0, MAX_CART_LINES).map(([productId, quantity]) => ({ productId, quantity }));
}

export function readCart(storage) {
  try {
    const stored = (storage ?? globalThis.localStorage)?.getItem(CART_STORAGE_KEY);
    return stored ? normalizeCart(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
}

export function writeCart(items, storage) {
  try {
    (storage ?? globalThis.localStorage)?.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCart(items)));
    return true;
  } catch {
    return false;
  }
}

export function addCartItem(items, productId, amount = 1) {
  const id = typeof productId === 'string' ? productId.trim() : '';
  if (!id || id.length > 100 || !Number.isInteger(amount) || amount < 1) {
    throw new Error('Choose a valid product and quantity.');
  }
  const cart = normalizeCart(items);
  const existing = cart.find((item) => item.productId === id);
  if (existing) {
    const nextQuantity = existing.quantity + amount;
    if (nextQuantity > MAX_ITEM_QUANTITY) throw new Error(`You can add up to ${MAX_ITEM_QUANTITY} of an item.`);
    return cart.map((item) => item.productId === id ? { ...item, quantity: nextQuantity } : item);
  }
  if (cart.length >= MAX_CART_LINES) throw new Error(`Your cart can contain up to ${MAX_CART_LINES} products.`);
  return [...cart, { productId: id, quantity: Math.min(amount, MAX_ITEM_QUANTITY) }];
}

export function setCartQuantity(items, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
    throw new Error(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`);
  }
  return normalizeCart(items).map((item) => item.productId === productId ? { ...item, quantity } : item);
}

export function removeCartItem(items, productId) {
  return normalizeCart(items).filter((item) => item.productId !== productId);
}

export function cartItemCount(items) {
  return normalizeCart(items).reduce((total, item) => total + item.quantity, 0);
}

export function estimateCartSubtotal(items, productById) {
  return normalizeCart(items).reduce((total, item) => {
    const product = productById.get(item.productId);
    if (!product) return total;
    const price = Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price)
      ? Number(product.offerPrice)
      : Number(product.price);
    return Number.isFinite(price) && price >= 0 ? total + price * item.quantity : total;
  }, 0);
}
