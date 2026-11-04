import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getCustomerOrder } from '../api/customer.js';
import { priceLabel } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { orderStatusLabel, recordedCollectionPoint } from '../orders/fulfillment.js';

export default function OrderConfirmationPage() {
  const { id = '' } = useParams();
  const { state: navigationState } = useLocation();
  const { session } = useAuth();
  const [order, setOrder] = useState(navigationState?.order || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!navigationState?.order);
  useEffect(() => {
    if (order || !session) return undefined;
    const controller = new AbortController();
    getCustomerOrder(id, { signal: controller.signal }).then((value) => {
      if (!controller.signal.aborted) setOrder(value);
    }).catch((reason) => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, order, session]);
  return <div className="page-wrap confirmation-page"><section className="confirmation-card">
    <span className="confirmation-check"><CheckCircle2 size={34} /></span>
    <span className="eyebrow">Order submitted</span><h1>Thank you for <em>your order.</em></h1>
    {loading && <LoadingState label="Confirming your order details" />}
    {error && <ErrorState message={error} />}
    {order && <><p>Your order was created successfully. YoMart has confirmed the server-calculated total. Your destination city helps coordinate transport; staff will agree a collection point with you.</p><div className="confirmation-total"><span>Order #{String(order._id || order.id || id).slice(-8).toUpperCase()} · {orderStatusLabel(order.orderStatus)}</span><strong>{priceLabel(order.totalPrice)}</strong></div>{order.paymentMethodSnapshot?.name && <p>Payment method: {order.paymentMethodSnapshot.name}</p>}{recordedCollectionPoint(order.collectionPoint) && <p>Agreed collection point: {order.collectionPoint.name}, {order.collectionPoint.address}, {order.collectionPoint.city}</p>}<div className="confirmation-actions"><Link className="button button-primary" to={`/orders/${encodeURIComponent(id)}`}>View order</Link><Link className="button button-ghost" to="/products">Continue shopping</Link></div></>}
    {!order && !loading && !error && <ErrorState message="Order confirmation is unavailable." />}
  </section></div>;
}
