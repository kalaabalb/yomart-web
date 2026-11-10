import { ArrowRight, ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBrands, getCategories, getCollections, getPosters, getProducts } from '../api/catalog.js';
import { imageUrl, priceLabel, productId } from '../api/http.js';
import { useResource } from '../hooks.js';
import { BrandMark, CatalogImage, CategoryTile, ProductGrid } from '../components/CatalogCards.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx';

function useCatalogData(name, loader) {
  return useResource(loader, name);
}

function ProductSection({ title, eyebrow, products, loading, error, retry, link = '/products' }) {
  return <section className="content-section">
    <div className="section-heading" data-reveal><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link className="text-link" to={link}>View all <ArrowRight size={16} /></Link></div>
    {loading ? <LoadingState label="Loading products" /> : error ? <ErrorState message={error} onRetry={retry} /> : products.length ? <ProductGrid products={products.slice(0, 8)} /> : <EmptyState title="No products to show" detail="The catalog is empty or its products are currently unavailable." />}
  </section>;
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
  const featured = productList.find((product) => Number(product.quantity) > 0 && imageUrl(product.images?.[0]?.url)) || productList.find((product) => imageUrl(product.images?.[0]?.url));
  const featuredPrice = featured && (Number(featured.offerPrice) > 0 && Number(featured.offerPrice) < Number(featured.price) ? featured.offerPrice : featured.price);
  const categoryChips = (categories.value || []).slice(0, 6);
  const ribbonWords = [...(categories.value || []).map((item) => item.name), ...(brands.value || []).map((item) => item.name)].filter(Boolean);
  const ribbon = ribbonWords.length ? ribbonWords : ['New arrivals', 'Everyday tech', 'Clear prices', 'Shop YoMart'];

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return <>
    <section className="hero-wrap">
      <div className="hero-copy">
        <span className="hero-pill"><b><Sparkles size={12} /> New</b> Fresh picks in the catalog</span>
        <h1>Shop what’s <em>worth&nbsp;having.</em></h1>
        <p>Phones, audio and everyday tech from the YoMart catalog. Clear prices in Birr, clean photos, and honest stock levels.</p>
        <form className="hero-search" onSubmit={submitSearch} role="search">
          <Search size={20} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search phones, speakers, watches…" aria-label="Search products by name" enterKeyHint="search" />
          <button type="submit">Search</button>
        </form>
        {categoryChips.length > 0 && <div className="hero-chips" aria-label="Popular categories">{categoryChips.map((category) => <Link className="chip" key={category._id || category.id} to={`/products?category=${encodeURIComponent(category._id || category.id || '')}`}>{category.name}</Link>)}</div>}
      </div>
      <div className="hero-art" aria-label={poster ? poster.posterName : 'YoMart catalog feature'}>
        <div className="hero-arch">
          {heroImage ? <CatalogImage src={heroImage} alt={poster?.posterName || 'Featured catalog banner'} fallback={<div className="hero-art-empty"><span>YM</span></div>} /> : <div className="hero-art-empty"><span>YM</span></div>}
        </div>
        <span className="hero-sun" aria-hidden="true" />
        {poster && <div className="hero-caption"><span>From the catalog</span><strong>{poster.posterName}</strong>{poster.subtitle && <small>{poster.subtitle}</small>}</div>}
        {featured && <Link className="hero-featured" to={`/products/${encodeURIComponent(productId(featured))}`}>
          <span className="thumb"><CatalogImage src={imageUrl(featured.images?.[0]?.url)} alt="" /></span>
          <span><small>Featured</small><strong>{featured.name}</strong><em>{priceLabel(featuredPrice)}</em></span>
        </Link>}
      </div>
    </section>

    <div className="catalog-ribbon" aria-hidden="true"><div className="ribbon-track">{[0, 1].map((copy) => <Fragment key={copy}>{ribbon.map((word, index) => <span key={`${copy}-${index}`}>{word}</span>)}</Fragment>)}</div></div>

    <section className="content-section" id="categories">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Find your focus</span><h2>Shop by category</h2></div><Link className="text-link" to="/products">All products <ArrowRight size={16} /></Link></div>
      {categories.loading ? <LoadingState label="Loading categories" /> : categories.error ? <ErrorState message={categories.error} onRetry={categories.retry} /> : categories.value?.length ? <div className="category-grid">{categories.value.slice(0, 8).map((category, index) => <CategoryTile key={category._id || category.id} category={category} index={index % 4} />)}</div> : <EmptyState title="No categories available" detail="Categories will appear here when they are available in the catalog." />}
    </section>

    <ProductSection title="Fresh in the catalog" eyebrow="Available now" products={productList} loading={products.loading} error={products.error} retry={products.retry} />

    <section className="content-section collection-section">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Curated by YoMart</span><h2>Collections</h2></div><span className="muted-note">Hand-picked from the live catalog</span></div>
      {collections.loading ? <LoadingState label="Loading collections" /> : collections.error ? <ErrorState message={collections.error} onRetry={collections.retry} /> : collections.value?.length ? <div className="collection-list">{collections.value.slice(0, 3).map((collection, index) => {
        const items = (collection.productIds || []).map((item) => productsById.get(String(item?._id || item))).filter(Boolean).slice(0, 3);
        return <article className={`collection-card collection-tone-${index + 1}`} data-reveal style={{ '--reveal-index': index }} key={collection._id || collection.id}>
          <div className="collection-copy"><span className="eyebrow">Collection {String(index + 1).padStart(2, '0')}</span><h3>{collection.title}</h3><p>{collection.subtitle}</p><Link to="/products">Explore collection <ArrowRight size={16} /></Link></div>
          <div className="collection-products">{products.loading ? <span className="collection-no-items">Loading catalog items</span> : products.error ? <span className="collection-no-items">Catalog items unavailable</span> : items.length ? items.map((product) => <div className="collection-thumb" key={productId(product)}><CatalogImage src={imageUrl(product.images?.[0]?.url)} alt="" loading="lazy" fallback={<span>{product.name?.slice(0, 1) || '•'}</span>} /></div>) : <span className="collection-no-items">No available products</span>}</div>
          <span className="collection-number" aria-hidden="true">{index + 1}</span>
        </article>;
      })}</div> : <EmptyState title="No collections available" detail="Curated collections will appear here when the store has published them." />}
    </section>

    <section className="content-section" id="brands">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Names you know</span><h2>Brands in the catalog</h2></div></div>
      <div className="brand-section" data-reveal>
        {brands.loading ? <LoadingState label="Loading brands" /> : brands.error ? <ErrorState message={brands.error} onRetry={brands.retry} /> : brands.value?.length ? <div className="brand-row">{brands.value.slice(0, 12).map((brand) => <BrandMark key={brand._id || brand.id} brand={brand} />)}</div> : <EmptyState title="No brands available" detail="Brands will appear here when they are available in the catalog." />}
      </div>
    </section>
    <section className="closing-callout" data-reveal><span className="eyebrow">Browse at your own pace</span><h2>Find what fits your everyday.</h2><Link className="button button-primary" to="/products">Explore the catalog <ArrowUpRight size={18} /></Link><span className="callout-mark" aria-hidden="true">Y</span></section>
  </>;
}
