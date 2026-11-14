import { ArrowRight, ArrowUpRight, ShieldCheck, Tag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBrands, getCategories, getCollections, getProducts } from '../api/catalog.js';
import { imageUrl, priceLabel, productId } from '../api/http.js';
import { useResource } from '../hooks.js';
import { deployment } from '../config/runtime.js';
import { BrandMark, CatalogImage, CategoryPill, ProductGrid } from '../components/CatalogCards.jsx';
import { CategorySkeletons, EmptyState, ErrorState, ProductSkeletons } from '../components/States.jsx';

function useCatalogData(name, loader) {
  return useResource(loader, name);
}

export default function HomePage() {
  const preview = deployment.buildEnv !== 'production';
  const products = useCatalogData('home-products', (signal) => getProducts({}, { signal }));
  const categories = useCatalogData('home-categories', (signal) => getCategories({ signal }));
  const brands = useCatalogData('home-brands', (signal) => getBrands({ signal }));
  const collections = useCatalogData('home-collections', (signal) => getCollections({ signal }));
  const productList = products.value || [];
  const productsById = new Map(productList.map((product) => [productId(product), product]));

  return <div className="homepage">
    <section className="hero-wrap" aria-labelledby="homepage-hero-title">
      <div className="hero-copy">
        <h1 id="homepage-hero-title"><span>Good things.</span><strong>Well chosen.</strong></h1>
        <p>Discover quality products<br className="hero-copy-break" /> with a better shopping experience.</p>
        <Link className="hero-shop-button" to="/products">Shop Now <ArrowRight size={20} aria-hidden="true" /></Link>
      </div>
      <div className="hero-stage" aria-label="Illustrative black over-ear headphones against a silver studio backdrop">
        <div className="hero-silver-arc hero-silver-arc-one" />
        <div className="hero-silver-arc hero-silver-arc-two" />
        <img className="hero-headphones" src="/homepage-headphones.webp" alt="" fetchPriority="high" />
      </div>
      <div className="hero-indicators" aria-hidden="true"><i className="active"/><i/><i/></div>
      <div className="hero-features" aria-label="Shopping information">
        <div><Store aria-hidden="true"/><span><strong>Wide Selection</strong><small>Across Categories</small></span></div>
        <div><ShieldCheck aria-hidden="true"/><span><strong>Product Information</strong><small>Details shown in catalog</small></span></div>
        <div><Tag aria-hidden="true"/><span><strong>Offers</strong><small>When listed in catalog</small></span></div>
      </div>
    </section>

    <section className="content-section" id="categories">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Browse</span><h2>Shop by category</h2></div><Link className="text-link" to="/products">All products <ArrowRight size={16} /></Link></div>
      {categories.loading ? <CategorySkeletons /> : categories.error ? <ErrorState message={categories.error} onRetry={categories.retry} /> : categories.value?.length ? <div className="category-row">{categories.value.slice(0, 10).map((category, index) => <CategoryPill key={category._id || category.id} category={category} index={index} />)}</div> : <EmptyState title="No categories available" detail="Categories will appear here when they are available in the catalog." />}
    </section>

    <section className="content-section">
      <div className="section-heading" data-reveal><div><span className="eyebrow">{preview ? 'Catalogue preview' : 'Catalog'}</span><h2>Products</h2></div><Link className="text-link" to="/products">View all <ArrowRight size={16} /></Link></div>
      {products.loading ? <ProductSkeletons /> : products.error ? <ErrorState message={products.error} onRetry={products.retry} /> : productList.length ? <ProductGrid products={productList.slice(0, 8)} /> : <EmptyState title="No products available" detail="Products will appear here when they are available in the catalog." />}
    </section>

    {(collections.loading || collections.error || collections.value?.length > 0) && <section className="content-section collection-section">
      <div className="section-heading" data-reveal><div><span className="eyebrow">Curated</span><h2>Collections</h2></div><span className="muted-note">{preview ? 'Preview catalogue' : 'Selected from the live catalog'}</span></div>
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

    <section className="closing-callout" id="about" data-reveal><div><span className="eyebrow">Ready when you are</span><h2>Find what fits your everyday.</h2></div><Link className="button button-light" to="/products">Explore the catalog <ArrowUpRight size={18} /></Link></section>
  </div>;
}
