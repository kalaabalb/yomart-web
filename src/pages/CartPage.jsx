import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProduct } from '../api/catalog.js';
import { imageUrl, priceLabel } from '../api/http.js';
import { useCart } from '../cart/CartContext.jsx';
import { estimateCartSubtotal } from '../cart/cart.js';
import { CatalogImage } from '../components/CatalogCards.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';

export default function CartPage() {
  const { items, itemCount, removeProduct, updateQuantity } = useCart();
  const [catalog, setCatalog] = useState({ loading: true, products: new Map(), error: '' });
  const [revision, setRevision] = useState(0);
  const productIds = items.map((item) => item.productId).sort();
  const productKey = productIds.join('|');

  useEffect(() => {
    if (!productIds.length) {
      setCatalog({ loading: false, products: new Map(), error: '' });
      return undefined;
    }
    const controller = new AbortController();
    setCatalog((current) => ({ ...current, loading: true, error: '' }));
    Promise.allSettled(productIds.map((id) => getProduct(id, { signal: controller.signal })))
      .then((results) => {
        if (controller.signal.aborted) return;
        const products = new Map();
        let failures = 0;
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value?._id) products.set(productIds[index], result.value);
          else failures += 1;
        });
        setCatalog({
          loading: false,
          products,
          error: failures ? 'Some products could not be checked against the live catalog. Try again before continuing.' : '',
        });
      });
    return () => controller.abort();
  }, [productKey, revision]);

  const subtotal = useMemo(() => estimateCartSubtotal(items, catalog.products), [items, catalog.products]);
  const allProductsAvailable = items.every((item) => catalog.products.has(item.productId));
  const allPricesAvailable = allProductsAvailable && items.every((item) => {
    const product = catalog.products.get(item.productId);
    return Number.isFinite(Number(product?.price)) && Number(product.price) >= 0;
  });

  if (!items.length) return <div className="page-wrap cart-page">
    <div className="page-intro"><span className="eyebrow">Your selection</span><h1>Your cart is <em>empty.</em></h1><p>Products you add will stay in this browser until you remove them.</p></div>
    <section className="cart-empty"><ShoppingBag size={34} /><h2>Nothing in your cart yet</h2><p>Browse the live catalog and add a product to get started.</p><Link className="button button-primary" to="/products">Browse products</Link></section>
  </div>;

  return <div className="page-wrap cart-page">
    <Link className="back-link" to="/products"><ArrowLeft size={16} /> Continue shopping</Link>
    <div className="page-intro"><span className="eyebrow">Your selection · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span><h1>Your shopping <em>bag.</em></h1><p>Prices and stock below are refreshed from the current catalog and are not reserved.</p></div>
    {catalog.loading && <LoadingState label="Checking the live catalog" />}
    {!catalog.loading && catalog.error && <ErrorState message={catalog.error} onRetry={() => setRevision((value) => value + 1)} />}
    <div className="cart-layout">
      <section className="cart-lines" aria-label="Cart products">
        {items.map((item) => {
          const product = catalog.products.get(item.productId);
          const image = imageUrl(product?.images?.[0]?.url);
          const stockKnown = product?.quantity !== null && product?.quantity !== undefined && Number.isFinite(Number(product.quantity));
          const maxQuantity = stockKnown ? Math.max(1, Math.min(100, Number(product.quantity))) : 100;
          const outOfStock = stockKnown && Number(product.quantity) < 1;
          return <article className="cart-line" key={item.productId}>
            <div className="cart-line-photo"><CatalogImage src={image} alt={product?.name || 'Catalog product'} fallback={<ShoppingBag size={24} />} /></div>
            <div className="cart-line-copy">
              <span className="product-meta">{product?.proCategoryId?.name || 'YoMart catalog'}</span>
              <h2>{product?.name || 'Product unavailable'}</h2>
              {product ? <><strong>{priceLabel(Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price) ? product.offerPrice : product.price)}</strong><span className={outOfStock || item.quantity > Number(product.quantity) ? 'cart-stock cart-stock-warning' : 'cart-stock'}>{outOfStock ? 'Out of stock' : stockKnown && item.quantity > Number(product.quantity) ? `Only ${product.quantity} currently available` : stockKnown ? `${product.quantity} in stock` : 'Stock not listed'}</span></> : <span className="cart-stock cart-stock-warning">Unavailable in the current catalog</span>}
              <div className="cart-line-actions">
                <div className="quantity-control" aria-label={`Quantity for ${product?.name || 'unavailable product'}`}>
                  <button type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label="Increase quantity" disabled={!product || item.quantity >= maxQuantity || outOfStock} onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus size={14} /></button>
                </div>
                <button type="button" className="remove-cart-item" onClick={() => removeProduct(item.productId)}><Trash2 size={14} /> Remove</button>
              </div>
            </div>
          </article>;
        })}
      </section>
      <aside className="cart-summary">
        <span className="eyebrow">Order summary</span>
        <div className="cart-summary-row"><span>Items</span><strong>{itemCount}</strong></div>
        <div className="cart-summary-row cart-subtotal"><span>Current catalog subtotal</span><strong>{allPricesAvailable ? priceLabel(subtotal) : 'Unavailable'}</strong></div>
        <p>Delivery fee and final order totals are confirmed by the backend during checkout.</p>
        {!allProductsAvailable && <p className="cart-warning">Remove unavailable items or reconnect to refresh their details.</p>}
        <Link className="button button-primary cart-summary-button" to="/checkout">Continue to checkout</Link>
      </aside>
    </div>
  </div>;
}
