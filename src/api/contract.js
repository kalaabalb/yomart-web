export function buildProductsPath({ search = '', category = '', inStock = '' } = {}) {
  const query = new URLSearchParams();
  if (search.trim()) query.set('search', search.trim());
  if (category) query.set('category', category);
  if (inStock) query.set('inStock', inStock);
  const encoded = query.toString();
  return `/products${encoded ? `?${encoded}` : ''}`;
}

export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export function productId(product) {
  return String(product?._id || product?.id || '');
}

export function catalogImageUrl(value, apiOrigin) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const trimmed = value.trim();
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return `${apiOrigin}${trimmed}`;
  return '';
}

export function priceLabel(value) {
  if (value === null || value === undefined || value === '') return 'Price unavailable';
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0
    ? `Birr ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : 'Price unavailable';
}
