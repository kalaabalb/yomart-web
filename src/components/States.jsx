import { AlertTriangle, LoaderCircle, PackageOpen, RefreshCw } from 'lucide-react';

export function LoadingState({ label = 'Loading the catalog' }) {
  return <div className="state-panel state-loading" role="status"><LoaderCircle className="spin" size={22} /><span>{label}</span><span className="loading-skeleton" aria-hidden="true"><i /><i /><i /></span></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="state-panel state-error" role="alert"><AlertTriangle size={22} /><div><strong>We couldn’t load this.</strong><p>{message}</p>{onRetry && <button className="button button-quiet" onClick={onRetry}><RefreshCw size={15} /> Try again</button>}</div></div>;
}

export function EmptyState({ title = 'Nothing here yet', detail = 'There are no catalog items to show right now.' }) {
  return <div className="state-panel state-empty"><PackageOpen size={24} /><div><strong>{title}</strong><p>{detail}</p></div></div>;
}

export function ProductSkeletons({ count = 8 }) {
  return <div className="product-grid" role="status" aria-label="Loading products">{Array.from({ length: count }, (_, index) => <div className="product-card skeleton-card" key={index} style={{ '--card-delay': `${index * 70}ms` }}><div className="product-photo skeleton" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line is-short" /><div className="skeleton skeleton-line is-price" /></div>)}</div>;
}

export function CategorySkeletons({ count = 6 }) {
  return <div className="category-row" role="status" aria-label="Loading categories">{Array.from({ length: count }, (_, index) => <div className="category-pill skeleton-card" key={index}><span className="category-orb skeleton" /><span className="skeleton skeleton-line is-short" /></div>)}</div>;
}
