import { ArrowUpRight, Check, Image as ImageIcon, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl, priceLabel, productId } from '../api/http.js';
import { useCart } from '../cart/CartContext.jsx';

export function CatalogImage({ src, alt = '', fallback = null, ...imageProps }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return fallback;
  return <img {...imageProps} src={src} alt={alt} onError={() => setFailed(true)} />;
}

export function discountPercent(product) {
  const price = Number(product?.price);
  const offer = Number(product?.offerPrice);
  if (!(offer > 0) || !(price > 0) || offer >= price) return 0;
  return Math.round((1 - offer / price) * 100);
}

export function ProductCard({ product, index = 0 }) {
  const { addProduct } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const sorted = [...(product.images || [])].sort((a, b) => Number(a.image) - Number(b.image));
  const photo = imageUrl(sorted[0]?.url);
  const alt = imageUrl(sorted[1]?.url);
  const category = product.proCategoryId?.name;
  const id = productId(product);
  const percent = discountPercent(product);
  const price = percent ? product.offerPrice : product.price;
  const inventoryKnown = product.quantity !== null && product.quantity !== undefined && product.quantity !== '' && Number.isFinite(Number(product.quantity));
  const soldOut = inventoryKnown && Number(product.quantity) <= 0;
  const name = product.name || 'Unnamed catalog item';

  function quickAdd() {
    if (addProduct(product)) {
      setAdded(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAdded(false), 1400);
    }
  }

  return <article className={soldOut ? 'product-card is-soldout' : 'product-card'} data-reveal style={{ '--reveal-index': index % 4 }}>
    <div className={alt ? 'product-photo has-alt' : 'product-photo'}>
      <CatalogImage className="photo-main" src={photo} alt="" loading="lazy" decoding="async" fallback={<div className="photo-missing"><ImageIcon size={28} /><span>Image unavailable</span></div>} />
      {alt && <CatalogImage className="photo-alt" src={alt} alt="" loading="lazy" decoding="async" />}
      {Number(product.quantity) > 0 && !percent && <span className="stock-badge"><i /> In stock</span>}
      {percent > 0 && <span className="sale-badge">−{percent}%</span>}
      {!soldOut && <button type="button" className={added ? 'quick-add is-added' : 'quick-add'} aria-label={`Add ${name} to cart`} onClick={quickAdd}>{added ? <Check size={20} /> : <Plus size={22} />}</button>}
    </div>
    <div className="product-card-copy">
      <div className="product-meta"><span>{category || 'YoMart catalog'}</span>{product.proBrandId?.name && <span>{product.proBrandId.name}</span>}</div>
      <h3>{name}</h3>
      <div className="product-price-row"><strong>{priceLabel(price)}</strong>{percent > 0 && <del>{priceLabel(product.price)}</del>}{soldOut && <span className="out-label">Out of stock</span>}</div>
    </div>
    <Link className="product-card-link" to={`/products/${encodeURIComponent(id)}`} aria-label={`View ${name}`} />
  </article>;
}

export function ProductGrid({ products }) {
  return <div className="product-grid">{products.map((product, index) => <ProductCard key={productId(product)} product={product} index={index} />)}</div>;
}

export function CategoryTile({ category, index = 0 }) {
  const image = imageUrl(category.image);
  return <Link className="category-tile" data-reveal style={{ '--reveal-index': index }} to={`/products?category=${encodeURIComponent(category._id || category.id || '')}`}>
    <div className="category-image"><CatalogImage src={image} alt="" loading="lazy" fallback={<ImageIcon size={28} />} /></div>
    <span>{category.name}</span><ArrowUpRight size={18} />
  </Link>;
}

export function BrandMark({ brand }) {
  const logo = imageUrl(brand.logoUrl);
  return <div className="brand-mark" title={brand.name}>
    <CatalogImage src={logo} alt="" loading="lazy" fallback={<span>{brand.name?.slice(0, 1)?.toUpperCase() || '•'}</span>} />
    <small>{brand.name}</small>
  </div>;
}
