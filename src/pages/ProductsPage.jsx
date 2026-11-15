import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/catalog.js';
import { ProductGrid } from '../components/CatalogCards.jsx';
import { EmptyState, ErrorState, ProductSkeletons } from '../components/States.jsx';
import { useResource } from '../hooks.js';
import { deployment } from '../config/runtime.js';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const preview = deployment.buildEnv !== 'production';
  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const [input, setInput] = useState(search);
  const [stockOnly, setStockOnly] = useState(false);
  const searchRef = useRef(null);
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

  const activeCategory = (categories.value || []).find((item) => (item._id || item.id) === category);
  return <div className="catalog-page page-wrap">
    <header className="catalog-editorial page-intro">
      <div><span className="eyebrow">THE YOMART CATALOG</span><h1>{activeCategory ? activeCategory.name : 'Shop'}<em>.</em></h1><p>Search by product name or explore the available categories.</p></div>
      <span className="catalog-editorial-mark" aria-hidden="true">YM / 01</span>
    </header>
    <div className="catalog-layout">
      <aside className="catalog-sidebar" aria-label="Product categories">
        <h2>Categories</h2>
        <div className="catalog-category-list" role="group" aria-label="Filter by category">
          <button type="button" className={category ? '' : 'is-active'} aria-pressed={!category} onClick={() => changeCategory('')}>All products</button>
          {(categories.value || []).map((item) => { const value = item._id || item.id; return <button type="button" key={value} className={category === value ? 'is-active' : ''} aria-pressed={category === value} onClick={() => changeCategory(value)}>{item.name}</button>; })}
        </div>
      </aside>
      <section className="catalog-main" aria-label="Shop products">
        <div className="catalog-toolbar">
          <label className="catalog-mobile-category">Category<select aria-label="Filter products by category" value={category} onChange={(event) => changeCategory(event.target.value)}><option value="">All products</option>{(categories.value || []).map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.name}</option>)}</select></label>
          <label className="catalog-search"><Search size={19} aria-hidden="true" /><input ref={searchRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search products" aria-label="Search products by name" enterKeyHint="search" />{input && <button type="button" aria-label="Clear search" onClick={() => setInput('')}><X size={16} /></button>}</label>
          {!preview && <label className="stock-filter"><input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} /><span className="dot" aria-hidden="true" /><span>In stock</span></label>}
        </div>
        <div className="catalog-results"><span>{resource.loading ? 'Loading catalog' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}</span><span>{preview ? 'Preview catalogue; prices and availability are being confirmed' : 'Catalog results update from YoMart'}</span></div>
        {resource.loading ? <ProductSkeletons /> : resource.error ? <ErrorState message={resource.error} onRetry={resource.retry} /> : products.length ? <ProductGrid products={products} /> : <EmptyState title="No matching products" detail={preview ? 'Try another name or category.' : 'Try another name or category, or clear the in-stock filter.'} />}
        {categories.error && <p className="inline-warning">Categories could not be loaded. Product search is still available.</p>}
      </section>
    </div>
  </div>;
}
