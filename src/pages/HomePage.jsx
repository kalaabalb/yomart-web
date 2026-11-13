import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBrands, getCategories, getCollections, getPosters, getProducts } from '../api/catalog.js';
import { imageUrl, priceLabel, productId } from '../api/http.js';
import { useResource } from '../hooks.js';
import { BrandMark, CatalogImage, CategoryPill, ProductGrid } from '../components/CatalogCards.jsx';
import { CategorySkeletons, EmptyState, ErrorState, ProductSkeletons } from '../components/States.jsx';

function useCatalogData(name, loader) {
  return useResource(loader, name);
}

function pricePoint(product) {
  return Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price) ? product.offerPrice : product.price;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const products = useCatalogData('home-products', (signal) => getProducts({}, { signal }));
  const categories = useCatalogData('home-categories', (signal) => getCategories({ signal }));
  const brands = useCatalogData('home-brands', (signal) => getBrands({ signal }));
  const collections = useCatalogData('home-collections', (signal) => getCollections({ signal }));
  const posters = useCatalogData('home-posters', (signal) => getPosters({ signal }));
  const productList = products.value || [];
  const poster = (posters.value || [])[0];
  const heroImage = imageUrl(poster?.imageUrl);
  const productsById = new Map(productList.map((product) => [productId(product), product]));
  const withPhotos = productList.filter((product) => imageUrl(product.images?.[0]?.url));
  const floating = (withPhotos.filter((product) => Number(product.quantity) > 0).length >= 2 ? withPhotos.filter((product) => Number(product.quantity) > 0) : withPhotos).slice(0, 3);
  const categoryChips = (categories.value || []).slice(0, 6);

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return <>
    <section className="hero-wrap">
      <div className="hero-copy">
        <span className="hero-pill"><i /> The YoMart catalog</span>
        <h1>Good things.<br /><em>Well chosen.</em></h1>
        <p>Browse phones, audio and everyday tech using product information from the YoMart catalog.</p>
        <form className="hero-search" onSubmit={submitSearch} role="search">
          <Search size={20} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search phones, speakers, watches…" aria-label="Search products by name" enterKeyHint="search" />
          <button type="submit">Search</button>
        </form>
        {categoryChips.length > 0 && <div className="hero-chips" aria-label="Browse categories"><span>Browse:</span>{categoryChips.map((category) => <Link key={category._id || category.id} to={`/products?category=${encodeURIComponent(category._id || category.id || '')}`}>{category.name}</Link>)}</div>}
        <dl className="hero-stats">
          <div><dt>Products</dt><dd>{products.loading ? '—' : productList.length}</dd></div>
          <div><dt>Categories</dt><dd>{categories.loading ? '—' : (categories.value || []).length}</dd></div>
          <div><dt>Brands</dt><dd>{brands.loading ? '—' : (brands.value || []).length}</dd></div>
        </dl>
      </div>
      <div className="hero-stage" aria-label={poster ? poster.posterName : 'Featured from the catalog'}>
        <div className="hero-panel">
          {heroImage ? <CatalogImage src={heroImage} alt={poster?.posterName || 'Featured catalog banner'} fallback={<span className="hero-panel-mark">YM</span>} /> : floating[0] ? <CatalogImage className="hero-panel-product" src={imageUrl(floating[0].images?.[0]?.url)} alt="" fallback={<span className="hero-panel-mark">YM</span>} /> : <span className="hero-panel-mark">YM</span>}
          {poster && <div className="hero-panel-caption"><strong>{poster.posterName}</strong>{poster.subtitle && <span>{poster.subtitle}</span>}</div>}
        </div>
        {floating.slice(heroImage ? 0 : 1, heroImage ? 2 : 3).map((product, index) => <Link key={productId(product)} className={`hero-float hero-float-${index + 1}`} to={`/products/${encodeURIComponent(productId(product))}`}>
          <span className="thumb"><CatalogImage src={imageUrl(product.images?.[0]?.url)} alt="" /></span>
          <span><strong>{product.name}</strong><em>{priceLabel(pricePoint(product))}</em></span>
        </Link>)}
      </div>
    </section>

    <section className="content-section" id="categories">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Browse</span><h2>Shop by category</h2></div><Link className="text-link" to="/products">All products <ArrowRight size={16} /></Link></div>
      {categories.loading ? <CategorySkeletons /> : categories.error ? <ErrorState message={categories.error} onRetry={categories.retry} /> : categories.value?.length ? <div className="category-row">{categories.value.slice(0, 10).map((category, index) => <CategoryPill key={category._id || category.id} category={category} index={index} />)}</div> : <EmptyState title="No categories available" detail="Categories will appear here when they are available in the catalog." />}
    </section>

    <section className="content-section">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Catalog</span><h2>Products</h2></div><Link className="text-link" to="/products">View all <ArrowRight size={16} /></Link></div>
      {products.loading ? <ProductSkeletons /> : products.error ? <ErrorState message={products.error} onRetry={products.retry} /> : productList.length ? <ProductGrid products={productList.slice(0, 8)} /> : <EmptyState title="No products available" detail="Products will appear here when they are available in the catalog." />}
    </section>

    {(collections.loading || collections.error || collections.value?.length > 0) && <section className="content-section collection-section">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Curated</span><h2>Collections</h2></div></div>
      {collections.loading ? <ProductSkeletons count={3} /> : collections.error ? <ErrorState message={collections.error} onRetry={collections.retry} /> : <div className="collection-list">{collections.value.slice(0, 3).map((collection, index) => {
        const items = (collection.productIds || []).map((item) => productsById.get(String(item?._id || item))).filter(Boolean).slice(0, 3);
        return <article className={`collection-card collection-tone-${index + 1}`} data-reveal style={{ '--reveal-index': index }} key={collection._id || collection.id}>
          <div className="collection-copy"><h3>{collection.title}</h3><p>{collection.subtitle}</p><Link to="/products">Explore <ArrowUpRight size={16} /></Link></div>
          <div className="collection-products">{products.loading ? null : items.map((product) => <div className="collection-thumb" key={productId(product)}><CatalogImage src={imageUrl(product.images?.[0]?.url)} alt="" loading="lazy" fallback={<span>{product.name?.slice(0, 1) || '•'}</span>} /></div>)}</div>
        </article>;
      })}</div>}
    </section>}

    {(brands.loading || brands.error || brands.value?.length > 0) && <section className="content-section" id="brands">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Brands</span><h2>Brands in the catalog</h2></div></div>
      {brands.loading ? <CategorySkeletons count={5} /> : brands.error ? <ErrorState message={brands.error} onRetry={brands.retry} /> : <div className="brand-row" data-reveal>{brands.value.slice(0, 12).map((brand) => <BrandMark key={brand._id || brand.id} brand={brand} />)}</div>}
    </section>}

    <section className="closing-callout" data-reveal><div><span className="eyebrow">Ready when you are</span><h2>Find what fits your everyday.</h2></div><Link className="button button-light" to="/products">Explore the catalog <ArrowUpRight size={18} /></Link></section>
  </>;
}
