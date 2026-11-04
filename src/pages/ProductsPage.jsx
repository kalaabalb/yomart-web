import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/catalog.js';
import { ProductGrid } from '../components/CatalogCards.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx';
import { useResource } from '../hooks.js';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const [input, setInput] = useState(search);
  const [stockOnly, setStockOnly] = useState(false);
  useEffect(() => setInput(search), [search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (input.trim() === search) return;
      const next = new URLSearchParams(params);
      if (input.trim()) next.set('q', input.trim()); else next.delete('q');
      setParams(next, { replace: true });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [input, search, params, setParams]);

  const categories = useResource((signal) => getCategories({ signal }), 'catalog-categories');
  const resource = useResource((signal) => getProducts({ search, category, inStock: stockOnly ? 'true' : '' }, { signal }), `${search}|${category}|${stockOnly}`);
  const products = resource.value || [];

  function changeCategory(value) {
    const next = new URLSearchParams(params);
    if (value) next.set('category', value); else next.delete('category');
    setParams(next, { replace: true });
  }

  return <div className="catalog-page page-wrap">
    <div className="page-intro"><span className="eyebrow">The YoMart catalog</span><h1>Find your next <em>favorite.</em></h1><p>Search by product name or browse the available categories.</p></div>
    <section className="catalog-controls" aria-label="Catalog filters">
      <label className="catalog-search"><Search size={18} /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search products by name" aria-label="Search products by name" />{input && <button type="button" aria-label="Clear search" onClick={() => setInput('')}><X size={15} /></button>}</label>
      <label className="select-control"><SlidersHorizontal size={16} /><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="">All categories</option>{(categories.value || []).map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.name}</option>)}</select></label>
      <label className="stock-filter"><input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} /><span>In stock</span></label>
    </section>
    <div className="catalog-results"><span>{resource.loading ? 'Loading catalog' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}</span><span>Catalog results update from YoMart</span></div>
    {resource.loading ? <LoadingState label="Loading products" /> : resource.error ? <ErrorState message={resource.error} onRetry={resource.retry} /> : products.length ? <ProductGrid products={products} /> : <EmptyState title="No matching products" detail="Try another name or category, or clear the in-stock filter." />}
    {categories.error && <p className="inline-warning">Categories could not be loaded. Product search is still available.</p>}
  </div>;
}
