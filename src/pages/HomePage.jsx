import { ArrowRight, ArrowUpRight, BadgeCheck, MoveRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBrands, getCategories, getCollections, getPosters, getProducts } from '../api/catalog.js';
import { imageUrl, productId } from '../api/http.js';
import { useResource } from '../hooks.js';
import { deployment } from '../config/runtime.js';
import { BrandMark, CatalogImage, CategoryTile, ProductGrid } from '../components/CatalogCards.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx';

function useCatalogData(name, loader) {
  return useResource(loader, name);
}

function ProductSection({ title, eyebrow, products, loading, error, retry, link = '/products' }) {
  return <section className="content-section">
    <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><Link className="text-link" to={link}>View catalog <ArrowRight size={16} /></Link></div>
    {loading ? <LoadingState label="Loading products" /> : error ? <ErrorState message={error} onRetry={retry} /> : products.length ? <ProductGrid products={products.slice(0, 8)} /> : <EmptyState title="No products to show" detail="The catalog is empty or its products are currently unavailable." />}
  </section>;
}

export default function HomePage() {
  const preview = deployment.buildEnv !== 'production';
  const products = useCatalogData('home-products', (signal) => getProducts({}, { signal }));
  const categories = useCatalogData('home-categories', (signal) => getCategories({ signal }));
  const brands = useCatalogData('home-brands', (signal) => getBrands({ signal }));
  const collections = useCatalogData('home-collections', (signal) => getCollections({ signal }));
  const posters = useCatalogData('home-posters', (signal) => getPosters({ signal }));
  const productList = products.value || [];
  const poster = (posters.value || [])[0];
  const heroImage = imageUrl(poster?.imageUrl);
  const productsById = new Map(productList.map((product) => [productId(product), product]));

  return <>
    <section className="hero-wrap">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={14} /> The YoMart edit</span>
        <h1>Good things.<br /><em>Well chosen.</em></h1>
        <p>{preview ? 'Browse the YoMart catalogue preview while product details are being confirmed.' : 'Explore the products and brands available in the YoMart catalog.'}</p>
        <div className="hero-actions"><Link className="button button-primary" to="/products">Browse products <ArrowRight size={17} /></Link><a className="button button-ghost" href="#categories">Explore categories <MoveRight size={16} /></a></div>
        <div className="hero-trust"><BadgeCheck size={16} /><span>{preview ? 'Catalogue details are being reviewed before ordering opens' : 'Catalog details come directly from YoMart'}</span></div>
      </div>
      <div className="hero-art" aria-label={poster ? poster.posterName : 'YoMart catalog feature'}>
        <div className="hero-art-glow" />
        {heroImage ? <CatalogImage src={heroImage} alt={poster?.posterName || 'Featured catalog banner'} fallback={<div className="hero-art-empty"><span>YM</span><i /></div>} /> : <div className="hero-art-empty"><span>YM</span><i /></div>}
        {poster && <div className="hero-caption"><span>From the catalog</span><strong>{poster.posterName}</strong>{poster.subtitle && <small>{poster.subtitle}</small>}</div>}
        <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" />
      </div>
      <div className="hero-index"><span>01</span><span className="hero-index-line" /><span>YO · MART</span></div>
    </section>

    <div className="catalog-ribbon"><span>Explore the collection</span><span className="ribbon-line"/><span>Products · Categories · Brands</span><span className="ribbon-star">✳</span></div>

    <section className="content-section" id="categories">
      <div className="section-heading"><div><span className="eyebrow">Find your focus</span><h2>Shop by category</h2></div><Link className="text-link" to="/products">All products <ArrowRight size={16} /></Link></div>
      {categories.loading ? <LoadingState label="Loading categories" /> : categories.error ? <ErrorState message={categories.error} onRetry={categories.retry} /> : categories.value?.length ? <div className="category-grid">{categories.value.slice(0, 8).map((category) => <CategoryTile key={category._id || category.id} category={category} />)}</div> : <EmptyState title="No categories available" detail="Categories will appear here when they are available in the catalog." />}
    </section>

    <ProductSection title="From the catalog" eyebrow={preview ? 'Catalogue preview' : 'Available now'} products={productList} loading={products.loading} error={products.error} retry={products.retry} />

    <section className="content-section collection-section">
      <div className="section-heading"><div><span className="eyebrow">Curated by YoMart</span><h2>Collections</h2></div><span className="muted-note">{preview ? 'Preview catalogue' : 'Selected from the live catalog'}</span></div>
      {collections.loading ? <LoadingState label="Loading collections" /> : collections.error ? <ErrorState message={collections.error} onRetry={collections.retry} /> : collections.value?.length ? <div className="collection-list">{collections.value.slice(0, 3).map((collection, index) => {
        const items = (collection.productIds || []).map((item) => productsById.get(String(item?._id || item))).filter(Boolean).slice(0, 3);
        return <article className={`collection-card collection-tone-${index + 1}`} key={collection._id || collection.id}>
          <div className="collection-copy"><span className="eyebrow">Collection {String(index + 1).padStart(2, '0')}</span><h3>{collection.title}</h3><p>{collection.subtitle}</p><Link to="/products">Explore collection <ArrowRight size={15} /></Link></div>
          <div className="collection-products">{products.loading ? <span className="collection-no-items">Loading catalog items</span> : products.error ? <span className="collection-no-items">Catalog items unavailable</span> : items.length ? items.map((product) => <div className="collection-thumb" key={productId(product)}><CatalogImage src={imageUrl(product.images?.[0]?.url)} alt="" loading="lazy" fallback={<span>{product.name?.slice(0, 1) || '•'}</span>} /></div>) : <span className="collection-no-items">No available products</span>}</div>
          <span className="collection-number">0{index + 1}</span>
        </article>;
      })}</div> : <EmptyState title="No collections available" detail="Curated collections will appear here when the store has published them." />}
    </section>

    <section className="content-section brand-section" id="brands">
      <div className="section-heading"><div><span className="eyebrow">Names you know</span><h2>Brands in the catalog</h2></div></div>
      {brands.loading ? <LoadingState label="Loading brands" /> : brands.error ? <ErrorState message={brands.error} onRetry={brands.retry} /> : brands.value?.length ? <div className="brand-row">{brands.value.slice(0, 8).map((brand) => <BrandMark key={brand._id || brand.id} brand={brand} />)}</div> : <EmptyState title="No brands available" detail="Brands will appear here when they are available in the catalog." />}
      <p className="api-note">Brand-specific filtering is not available in the current catalog API.</p>
    </section>
    <section className="closing-callout"><span className="eyebrow">Browse at your own pace</span><h2>Find what fits<br />your everyday.</h2><Link className="button button-primary" to="/products">Explore the catalog <ArrowUpRight size={17} /></Link><span className="callout-mark">Y</span></section>
  </>;
}
