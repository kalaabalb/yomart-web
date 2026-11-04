import { ArrowLeft, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCustomerOrder } from '../api/customer.js';
import { priceLabel } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { customerDestination, orderStatusLabel, recordedCollectionPoint } from '../orders/fulfillment.js';

export default function OrderDetailsPage() {
  const { id = '' } = useParams();
  const { session } = useAuth();
  const [state, setState] = useState({ loading: true, order: null, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getCustomerOrder(id, { signal: controller.signal }).then((order) => {
      if (!controller.signal.aborted) setState({ loading: false, order, error: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ loading: false, order: null, error: error.message });
    });
    return () => controller.abort();
  }, [id, session?.token, revision]);

  if (state.loading) return <div className="page-wrap order-detail-page"><LoadingState label="Loading your order" /></div>;
  if (state.error || !state.order) return <div className="page-wrap order-detail-page"><Link className="back-link" to="/orders"><ArrowLeft size={16} /> Your orders</Link><ErrorState message={state.error || 'Order not found.'} onRetry={() => setRevision((n) => n + 1)} /></div>;

  const { order } = state;
  return <div className="page-wrap order-detail-page">
    <Link className="back-link" to="/orders"><ArrowLeft size={16} /> Your orders</Link>
    <div className="page-intro"><span className="eyebrow">Order details</span><h1>Order <em>#{String(order._id || order.id).slice(-8).toUpperCase()}.</em></h1><p>Placed {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'date unavailable'}</p></div>
    <div className="order-detail-layout">
      <section className="checkout-card order-items-card"><span className="eyebrow">Items</span>{(order.items || []).map((item, index) => <article className="order-detail-item" key={`${item.productID || item.productName}-${index}`}><span className="order-card-icon"><Package size={18} /></span><span><strong>{item.productName || 'Product'}</strong><small>{item.variant ? `${item.variant} · ` : ''}Quantity {item.quantity}</small></span><strong>{priceLabel(Number(item.price) * Number(item.quantity))}</strong></article>)}<div className="cart-summary-row"><span>Order total</span><strong>{priceLabel(order.totalPrice)}</strong></div></section>
      <aside className="cart-summary order-status-card"><span className="eyebrow">Status</span><div className="order-status-line"><span>Order status</span><strong>{orderStatusLabel(order.orderStatus)}</strong></div><div className="order-status-line"><span>Payment</span><strong>{String(order.paymentStatus || 'unknown').replaceAll('_', ' ')}</strong></div><div className="order-status-line"><span>Method</span><strong>{order.paymentMethodSnapshot?.name || String(order.paymentMethod || 'unknown')}</strong></div>{order.paymentMethodSnapshot && <div className="order-payment-snapshot">{order.paymentMethodSnapshot.providerName && <p><span>Provider</span>{order.paymentMethodSnapshot.providerName}</p>}{order.paymentMethodSnapshot.accountHolder && <p><span>Recipient</span>{order.paymentMethodSnapshot.accountHolder}</p>}{order.paymentMethodSnapshot.accountIdentifier && <p><span>Payment identifier</span>{order.paymentMethodSnapshot.accountIdentifier}</p>}{order.paymentMethodSnapshot.additionalDetails && <p><span>Details</span>{order.paymentMethodSnapshot.additionalDetails}</p>}{order.paymentMethodSnapshot.instructions && <p>{order.paymentMethodSnapshot.instructions}</p>}</div>}{order.shippingAddress && <div className="order-address"><span>Destination</span><p>{[customerDestination(order.shippingAddress).area, customerDestination(order.shippingAddress).city, customerDestination(order.shippingAddress).phone].filter(Boolean).join(' · ') || '—'}{customerDestination(order.shippingAddress).coordinates && <><br />{customerDestination(order.shippingAddress).coordinates}</>}</p></div>}{recordedCollectionPoint(order.collectionPoint) && <div className="order-address"><span>Agreed collection point</span><p>{order.collectionPoint.name}<br />{order.collectionPoint.address}<br />{order.collectionPoint.city}</p></div>}<p>YoMart staff coordinate the collection point with you. Payment evidence is kept private.</p></aside>
    </div>
  </div>;
}
