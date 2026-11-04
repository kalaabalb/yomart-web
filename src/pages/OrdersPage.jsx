import { ArrowRight, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerOrders } from '../api/customer.js';
import { priceLabel } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { orderStatusLabel } from '../orders/fulfillment.js';

export default function OrdersPage() {
  const { session } = useAuth();
  const [state, setState] = useState({ loading: true, orders: [], error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, orders: [], error: '' });
    getCustomerOrders({ signal: controller.signal }).then((value) => {
      if (!controller.signal.aborted) setState({ loading: false, orders: Array.isArray(value) ? value : [], error: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ loading: false, orders: [], error: error.message });
    });
    return () => controller.abort();
  }, [session?.token, revision]);

  return <div className="page-wrap orders-page">
    <div className="page-intro"><span className="eyebrow">Customer account</span><h1>Your <em>orders.</em></h1><p>Order status and payment status come directly from YoMart.</p></div>
    {state.loading && <LoadingState label="Loading your orders" />}
    {state.error && <ErrorState message={state.error} onRetry={() => setRevision((n) => n + 1)} />}
    {!state.loading && !state.error && !state.orders.length && <section className="cart-empty"><Package size={30} /><h2>No orders yet</h2><p>Orders you place will appear here.</p><Link className="button button-primary" to="/products">Browse products</Link></section>}
    <div className="orders-list">{state.orders.map((order) => <Link className="order-card" to={`/orders/${encodeURIComponent(order._id || order.id)}`} key={order._id || order.id}>
      <span className="order-card-icon"><Package size={20} /></span>
      <span className="order-card-copy"><strong>Order #{String(order._id || order.id).slice(-8).toUpperCase()}</strong><small>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Date unavailable'} · {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</small><span className="order-status-pills"><i>{orderStatusLabel(order.orderStatus)}</i><i>{String(order.paymentStatus || 'unknown').replaceAll('_', ' ')}</i></span></span>
      <strong className="order-card-total">{priceLabel(order.totalPrice)}</strong><ArrowRight size={16} />
    </Link>)}</div>
  </div>;
}
