import { ArrowLeft, Check, CreditCard, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/catalog.js';
import { createCustomerOrder, getCheckoutSettings, uploadPaymentProof } from '../api/customer.js';
import { imageUrl, priceLabel } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { estimateCartSubtotal } from '../cart/cart.js';
import { checkoutOrderBody, clearCheckoutAttempt, confirmCheckout, getStableCheckoutKey, paymentProofRequired, safePaymentLogoUrl } from '../checkout/checkout.js';
import { CatalogImage } from '../components/CatalogCards.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';

const PROOF_LIMIT = 10 * 1024 * 1024;
const PROOF_REF_PREFIX = 'yomart.checkout-proof.v1.';

function readProofReference(ownerId) {
  try {
    const value = JSON.parse(sessionStorage.getItem(`${PROOF_REF_PREFIX}${ownerId}`) || 'null');
    return value?.proofRecordId ? { proofRecordId: value.proofRecordId } : null;
  } catch { return null; }
}

function persistProofReference(ownerId, reference) {
  sessionStorage.setItem(`${PROOF_REF_PREFIX}${ownerId}`, JSON.stringify(reference));
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The selected receipt could not be read.'));
    reader.readAsDataURL(file);
  });
}

export default function CheckoutPage() {
  const { session, user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState('');
  const [catalog, setCatalog] = useState({ loading: true, products: new Map(), error: '' });
  const [address, setAddress] = useState({ phone: '', street: '', city: '' });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [proofReference, setProofReference] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const ownerId = String(user?._id || user?.id || '');

  useEffect(() => {
    const controller = new AbortController();
    getCheckoutSettings({ signal: controller.signal }).then((value) => {
      setSettings(value);
      const firstMethod = value?.paymentMethods?.[0];
      if (firstMethod) setPaymentMethod(firstMethod.code);
    }).catch((error) => { if (!controller.signal.aborted) setSettingsError(error.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!items.length) {
      setCatalog({ loading: false, products: new Map(), error: '' });
      return undefined;
    }
    const controller = new AbortController();
    setCatalog((old) => ({ ...old, loading: true, error: '' }));
    Promise.allSettled(items.map((item) => getProduct(item.productId, { signal: controller.signal }))).then((results) => {
      if (controller.signal.aborted) return;
      const products = new Map();
      let failed = false;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?._id) products.set(items[index].productId, result.value);
        else failed = true;
      });
      setCatalog({ loading: false, products, error: failed ? 'Some cart items could not be checked against the live catalog.' : '' });
    });
    return () => controller.abort();
  }, [items]);

  useEffect(() => {
    if (ownerId) setProofReference(readProofReference(ownerId));
  }, [ownerId]);

  const subtotal = useMemo(() => estimateCartSubtotal(items, catalog.products), [items, catalog.products]);
  const methods = settings?.paymentMethods || [];
  const selectedMethod = methods.find((method) => method.code === paymentMethod);
  const allCatalogReady = !catalog.loading && !catalog.error && items.length > 0 && items.every((item) => {
    const product = catalog.products.get(item.productId);
    return product && Number.isFinite(Number(product.price)) && Number(product.quantity) >= item.quantity;
  });

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    if (!session || !user) { setMessage('Sign in before checkout.'); return; }
    if (!items.length || !allCatalogReady || !selectedMethod) {
      setMessage('Checkout is not ready. Refresh the catalog and payment settings, then try again.');
      return;
    }
    if (!address.phone.trim() || !address.city.trim()) {
      setMessage('Enter a phone number and destination city.');
      return;
    }
    setBusy(true);
    setMessageType('error');
    try {
      let verifiedProof = null;
      if (paymentProofRequired(selectedMethod)) {
        verifiedProof = proofReference || readProofReference(ownerId);
        if (!verifiedProof) {
          if (!receipt) throw new Error('Upload a payment receipt for this payment method.');
          const dataUrl = await fileAsDataUrl(receipt);
          verifiedProof = await uploadPaymentProof(dataUrl);
          if (!verifiedProof?.proofRecordId) throw new Error('The receipt upload was not confirmed.');
          persistProofReference(ownerId, verifiedProof);
          setProofReference(verifiedProof);
        }
      }
      const body = checkoutOrderBody({
        items,
        shippingAddress: Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()])),
        paymentMethod,
        paymentProof: verifiedProof,
        requiresProof: paymentProofRequired(selectedMethod),
      });
      const idempotencyKey = await getStableCheckoutKey({ ownerId, body });
      const order = await createCustomerOrder(body, idempotencyKey);
      if (!confirmCheckout(order, clearCart)) throw new Error('The server did not confirm an order. Your cart is preserved; retry with the same details.');
      clearCheckoutAttempt();
      try { sessionStorage.removeItem(`${PROOF_REF_PREFIX}${ownerId}`); } catch { /* optional browser storage */ }
      setMessageType('success');
      setMessage('Your order is confirmed.');
      navigate(`/checkout/confirmation/${encodeURIComponent(order._id || order.id)}`, { replace: true, state: { order } });
    } catch (error) {
      setMessage(error.message || 'Order submission could not be confirmed. Keep the same details and retry.');
    } finally { setBusy(false); }
  }

  return <div className="page-wrap checkout-page">
    <Link className="back-link" to="/cart"><ArrowLeft size={16} /> Back to cart</Link>
    <div className="page-intro"><span className="eyebrow">Destination and payment</span><h1>Complete your <em>order.</em></h1><p>Provide your destination city for coordination. You will collect your order from a collection point agreed with YoMart; your location is not the collection-point address.</p></div>
    {(catalog.loading || settings === null && !settingsError) && <LoadingState label="Preparing checkout" />}
    {catalog.error && <ErrorState message={catalog.error} />}
    {settingsError && <ErrorState message={`Payment settings could not be loaded: ${settingsError}`} />}
    {!items.length && <section className="cart-empty"><h2>Your cart is empty</h2><Link className="button button-primary" to="/products">Browse products</Link></section>}
    {message && <p className={messageType === 'error' ? 'form-message form-message-error' : 'form-message'} role={messageType === 'error' ? 'alert' : 'status'}>{message}</p>}
    {items.length > 0 && <form className="checkout-layout" onSubmit={submit}>
      <section className="checkout-card">
        <span className="eyebrow">Destination information</span>
        <div className="checkout-fields">
          <label>Phone number<input autoComplete="tel" type="tel" maxLength="40" required value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} /></label>
          <label>Area or landmark (optional)<input autoComplete="street-address" maxLength="200" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} /></label>
          <label>Destination city<input autoComplete="address-level2" maxLength="100" required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} /></label>
        </div>
        <p className="checkout-note">Your phone and destination help staff coordinate transport. The agreed collection point will be shared with you separately.</p>
        <div className="checkout-payment-heading"><span className="eyebrow">Payment method</span><span>Configured by YoMart</span></div>
        {methods.length === 0 && <div className="inline-warning">No enabled payment methods are currently available.</div>}
        <div className="payment-method-list">{methods.map((method) => <label className={paymentMethod === method.code ? 'payment-method selected' : 'payment-method'} key={method.code}>
          <input type="radio" name="paymentMethod" value={method.code} checked={paymentMethod === method.code} onChange={() => setPaymentMethod(method.code)} />
          <span className="payment-method-mark">{safePaymentLogoUrl(method.logoUrl) ? <img src={safePaymentLogoUrl(method.logoUrl)} alt="" loading="lazy" /> : <CreditCard size={18} aria-hidden="true" />}</span>
          <span><strong>{method.name || method.title}</strong>{(method.description || method.subtitle) && <small>{method.description || method.subtitle}</small>}</span><Check size={17} />
        </label>)}</div>
        {selectedMethod && <div className="payment-method-details" aria-live="polite">
          {selectedMethod.providerName && <p><span>Provider</span><strong>{selectedMethod.providerName}</strong></p>}
          {selectedMethod.accountHolder && <p><span>Recipient</span><strong>{selectedMethod.accountHolder}</strong></p>}
          {selectedMethod.accountIdentifier && <p><span>Payment identifier</span><strong>{selectedMethod.accountIdentifier}</strong></p>}
          {selectedMethod.additionalDetails && <p><span>Details</span><strong>{selectedMethod.additionalDetails}</strong></p>}
          {selectedMethod.instructions && <p className="payment-instructions">{selectedMethod.instructions}</p>}
          {paymentProofRequired(selectedMethod) && <small>A receipt is required for this method. YoMart keeps submitted receipts private.</small>}
        </div>}
        {selectedMethod && paymentProofRequired(selectedMethod) && <label className="receipt-upload"><Upload size={18} /><span>{proofReference ? 'Receipt uploaded for this checkout attempt' : receipt?.name || 'Choose payment receipt'}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
          const file = event.target.files?.[0];
          setMessage('');
          if (!file) return;
          if (file.size > PROOF_LIMIT || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setReceipt(null); setMessage('Choose a JPEG, PNG, or WebP image no larger than 10 MiB.'); return;
          }
          setReceipt(file); setProofReference(null);
          try { sessionStorage.removeItem(`${PROOF_REF_PREFIX}${ownerId}`); } catch { /* optional storage */ }
        }} /></label>}
      </section>
      <aside className="cart-summary checkout-summary">
        <span className="eyebrow">Order summary · {items.length} {items.length === 1 ? 'line' : 'lines'}</span>
        <div className="checkout-summary-items">{items.map((item) => {
          const product = catalog.products.get(item.productId);
          const price = Number(product?.offerPrice) > 0 && Number(product?.offerPrice) < Number(product?.price) ? Number(product.offerPrice) : Number(product?.price);
          return <div className="checkout-summary-item" key={item.productId}><div className="checkout-summary-photo"><CatalogImage src={imageUrl(product?.images?.[0]?.url)} alt={product?.name || 'Catalog product'} /></div><span>{product?.name || 'Product'} <small>× {item.quantity}</small></span><strong>{Number.isFinite(price) ? priceLabel(price * item.quantity) : '—'}</strong></div>;
        })}</div>
        <div className="cart-summary-row"><span>Catalog subtotal</span><strong>{catalog.products.size === items.length ? priceLabel(subtotal) : '—'}</strong></div>
        <div className="cart-summary-row cart-subtotal"><span>Estimated total</span><strong>{catalog.products.size === items.length ? priceLabel(subtotal) : '—'}</strong></div>
        <p>The total shown is an estimate. The backend decides the final order total and available stock.</p>
        <button className="button button-primary checkout-submit" type="submit" disabled={busy || !allCatalogReady || !methods.length}>{busy ? 'Submitting securely…' : 'Place order'} <Check size={16} /></button>
      </aside>
    </form>}
  </div>;
}
