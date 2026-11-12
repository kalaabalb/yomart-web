import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { imageUrl, priceLabel, productId } from '../api/http.js';
import { deployment } from '../config/runtime.js';

export function CatalogImage({ src, alt = '', fallback = null, ...imageProps }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return fallback;
  return <img {...imageProps} src={src} alt={alt} onError={() => setFailed(true)} />;
}

export function ProductCard({ product, index = 0 }) {
  const image = [...(product.images || [])].sort((a, b) => Number(a.image) - Number(b.image))[0];
  const photo = imageUrl(image?.url);
  const category = product.proCategoryId?.name;
  const id = productId(product);
  const price = Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price)
    ? product.offerPrice
    : product.price;
  const preview = deployment.buildEnv !== 'production';
  const inventoryKnown = product.quantity !== null && product.quantity !== undefined && product.quantity !== '' && Number.isFinite(Number(product.quantity));
  return <Link className="product-card" to={`/products/${encodeURIComponent(id)}`} style={{ '--card-index': index }}>
    <div className="product-photo">
      <CatalogImage src={photo} alt={product.name || 'Catalog product'} loading="lazy" fallback={<div className="photo-missing"><ImageIcon size={28} /><span>Image unavailable</span></div>} />
      {!preview && Number(product.quantity) > 0 && <span className="stock-badge"><i /> In stock</span>}
      <span className="card-arrow"><ArrowUpRight size={17} /></span>
    </div>
    <div className="product-card-copy">
      <div className="product-meta"><span>{category || 'YoMart catalog'}</span>{product.proBrandId?.name && <span>{product.proBrandId.name}</span>}</div>
      <h3>{product.name || 'Unnamed catalog item'}</h3>
      <div className="product-price-row"><strong>{preview ? 'Price to be confirmed' : priceLabel(price)}</strong>{!preview && inventoryKnown && Number(product.quantity) <= 0 && <span className="out-label">Out of stock</span>}</div>
    </div>
  </Link>;
}

export function ProductGrid({ products }) {
  return <div className="product-grid">{products.map((product, index) => <ProductCard key={productId(product)} product={product} index={index} />)}</div>;
}

export function CategoryTile({ category }) {
  const image = imageUrl(category.image);
  return <Link className="category-tile" to={`/products?category=${encodeURIComponent(category._id || category.id || '')}`}>
    <div className="category-image"><CatalogImage src={image} alt="" loading="lazy" fallback={<ImageIcon size={24} />} /></div>
    <span>{category.name}</span><ArrowUpRight size={15} />
  </Link>;
}

export function BrandMark({ brand }) {
  const logo = imageUrl(brand.logoUrl);
  return <div className="brand-mark" title={brand.name}>
    <CatalogImage src={logo} alt="" loading="lazy" fallback={<span>{brand.name?.slice(0, 1)?.toUpperCase() || '•'}</span>} />
    <small>{brand.name}</small>
  </div>;
}
