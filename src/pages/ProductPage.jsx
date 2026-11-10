import { ArrowLeft, ArrowRight, Check, Image as ImageIcon, PackageCheck, ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/catalog.js';
import { imageUrl, priceLabel } from '../api/http.js';
import { useResource } from '../hooks.js';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { CatalogImage, discountPercent } from '../components/CatalogCards.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { RetailerContacts } from '../components/RetailerContacts.jsx';

export default function ProductPage() {
  const { id = '' } = useParams();
  const { addProduct } = useCart();
  const resource = useResource((signal) => getProduct(id, { signal }), id);
  const product = resource.value;
  const images = [...(product?.images || [])].sort((a, b) => Number(a.image) - Number(b.image)).map((entry) => imageUrl(entry.url)).filter(Boolean);
  const [selected, setSelected] = useState(0);
  const scroller = useRef(null);

  function onGalleryScroll(event) {
    const node = event.currentTarget;
    const index = Math.round(node.scrollLeft / Math.max(node.clientWidth, 1));
    if (index !== selected) setSelected(index);
  }
  function goTo(index) {
    setSelected(index);
    const node = scroller.current;
    if (node) node.scrollTo({ left: index * node.clientWidth, behavior: 'smooth' });
  }

  if (resource.loading) return <div className="page-wrap detail-loading"><LoadingState label="Loading product details" /></div>;
  if (resource.error) return <div className="page-wrap"><Link className="back-link" to="/products"><ArrowLeft size={16} /> Back to catalog</Link><ErrorState message={resource.error} onRetry={resource.retry} /></div>;
  if (!product) return <div className="page-wrap"><Link className="back-link" to="/products"><ArrowLeft size={16} /> Back to catalog</Link><ErrorState message="This product could not be found in the catalog." /></div>;

  const hasOffer = Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price);
  const inventoryKnown = product.quantity !== null && product.quantity !== undefined && product.quantity !== '' && Number.isFinite(Number(product.quantity));
  const available = inventoryKnown && Number(product.quantity) > 0;
  const category = product.proCategoryId;
  const categoryId = category?._id || category?.id;
  return <div className="product-detail page-wrap">
    <Link className="back-link" to="/products"><ArrowLeft size={16} /> Back to catalog</Link>
    <div className="detail-layout">
      <div className="detail-gallery">
        <div className="gallery-frame">
          <div className="detail-main-image" ref={scroller} onScroll={onGalleryScroll}>
            {images.length ? images.map((src, index) => <div className="detail-slide" key={src}><CatalogImage src={src} alt={index === 0 ? product.name : ''} loading={index === 0 ? 'eager' : 'lazy'} fallback={<div className="photo-missing"><ImageIcon size={36} /><span>Product image unavailable</span></div>} /></div>) : <div className="detail-slide"><div className="photo-missing"><ImageIcon size={36} /><span>Product image unavailable</span></div></div>}
          </div>
          {images.length > 1 && <span className="image-count">{selected + 1} / {images.length}</span>}
        </div>
        {images.length > 1 && <div className="detail-thumbnails">{images.map((src, index) => <button key={src} className={selected === index ? 'thumbnail is-selected' : 'thumbnail'} onClick={() => goTo(index)} aria-label={`Show product image ${index + 1}`}><CatalogImage src={src} alt="" fallback={<ImageIcon size={20} />} /></button>)}</div>}
      </div>
      <div className="detail-copy">
        <div className="detail-kicker"><span>{category?.name || 'YoMart catalog'}</span>{product.proBrandId?.name && <><i /> <span>{product.proBrandId.name}</span></>}</div>
        <h1>{product.name}</h1>
        <div className="detail-price"><strong>{priceLabel(hasOffer ? product.offerPrice : product.price)}</strong>{hasOffer && <del>{priceLabel(product.price)}</del>}{hasOffer && <span className="save">Save {discountPercent(product)}%</span>}</div>
        <div className={available ? 'availability available' : 'availability unavailable'}>{available ? <><Check size={16} /> Available in catalog</> : inventoryKnown ? <>Currently out of stock</> : <>Availability not listed</>}</div>
        {product.description && <p className="detail-description">{product.description}</p>}
        <div className="detail-facts"><div><span>Availability</span><strong>{available ? 'In stock' : inventoryKnown ? 'Out of stock' : 'Not listed'}</strong></div><div><span>Category</span><strong>{category?.name || 'Not listed'}</strong></div>{product.proBrandId?.name && <div><span>Brand</span><strong>{product.proBrandId.name}</strong></div>}</div>
        <div className="detail-note"><PackageCheck size={19} /><p>Price and availability are read live from the YoMart catalog, so what you see here is what is on the shelf.</p></div>
        <button className="button button-primary detail-cta is-desktop" type="button" disabled={inventoryKnown && !available} onClick={() => addProduct(product)}><ShoppingBag size={18} /> {inventoryKnown && !available ? 'Out of stock' : 'Add to cart'}</button>
        {categoryId && <Link className="button button-secondary detail-cta" to={`/products?category=${encodeURIComponent(categoryId)}`}>More in {category.name} <ArrowRight size={16} /></Link>}
        {!categoryId && <Link className="button button-secondary detail-cta" to="/products">Continue browsing <ArrowRight size={16} /></Link>}
        <RetailerContacts placement="product_details" className="detail-contacts" />
      </div>
    </div>
    <div className="buy-bar"><div className="buy-bar-price"><small>{hasOffer ? 'Offer price' : 'Price'}</small><strong>{priceLabel(hasOffer ? product.offerPrice : product.price)}</strong></div><button className="button button-primary" type="button" disabled={inventoryKnown && !available} onClick={() => addProduct(product)}><ShoppingBag size={18} /> {inventoryKnown && !available ? 'Out of stock' : 'Add to cart'}</button></div>
  </div>;
}
