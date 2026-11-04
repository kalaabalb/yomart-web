const statusLabels = {
  pending: 'Order received',
  processing: 'Processing',
  shipped: 'In transit to destination city',
  ready_for_collection: 'Ready for collection',
  collected: 'Collected',
  delivered: 'Delivered', // Historical status retained for older orders.
  cancelled: 'Cancelled',
  payment_pending: 'Payment pending',
  payment_verified: 'Payment verified',
};

export function orderStatusLabel(status) {
  const normalized = String(status || '').toLowerCase();
  return statusLabels[normalized] || normalized.replaceAll('_', ' ') || 'Unknown';
}

export function customerDestination(address = {}) {
  return {
    phone: String(address.phone || '').trim(),
    city: String(address.city || '').trim(),
    area: String(address.street || '').trim(),
    coordinates: address.latitude != null && address.longitude != null && Number.isFinite(Number(address.latitude)) && Number.isFinite(Number(address.longitude))
      ? `${address.latitude}, ${address.longitude}`
      : '',
  };
}

export function recordedCollectionPoint(point) {
  if (!point || !point.name || !point.address || !point.city) return null;
  return { name: point.name, address: point.address, city: point.city };
}
