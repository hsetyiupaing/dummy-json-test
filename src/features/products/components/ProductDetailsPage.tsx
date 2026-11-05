import { useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Box, Check, CircleAlert, ImageOff, Package, Pencil, ShieldCheck, Star, Trash2, Truck } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import './ProductDetailsPage.css'

/** Format product prices in the store's currency presentation. */
function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

/** Retrieve the requested product and render its gallery and full product summary. */
export default function ProductDetailsPage() {
  const { productId } = useParams()
  const id = Number(productId)
  const productQuery = useProduct(id)
  const [selectedImage, setSelectedImage] = useState(0)
  const product = productQuery.data
  const galleryImages = product ? [...new Set([product.thumbnail, ...product.images].filter(Boolean))] : []

  if (!Number.isInteger(id) || id <= 0) {
    return <DetailState title="Invalid product ID" message="The product address is not valid."/>
  }
  if (productQuery.isPending) return <DetailsSkeleton/>
  if (productQuery.isError) {
    const isNotFound = isAxiosError(productQuery.error) && productQuery.error.response?.status === 404
    return <DetailState title={isNotFound ? 'Product not found' : 'Couldn’t load product'} message={isNotFound ? 'This product may have been removed or the link may be incorrect.' : 'Check your connection and try again.'} retry={() => void productQuery.refetch()}/>
  }
  if (!product) return <DetailState title="Product not found" message="No product data was returned for this address."/>

  const availabilityClass = product.availabilityStatus.toLowerCase().replaceAll(' ', '-')
  const mainImage = galleryImages[selectedImage]

  return <div className="page-content detail-page">
    <Link className="back-link" to="/products"><ArrowLeft size={15}/> Back to products</Link>
    <div className="detail-heading"><div><div className="eyebrow">PRODUCT CATALOG / #{product.id}</div><h1>{product.title}</h1><p>Product details and inventory information.</p></div><div className="detail-actions"><button className="secondary-button detail-action" disabled title="Product editing is added in the upcoming update phase"><Pencil size={14}/> Edit product</button><button className="danger-button detail-action" disabled title="Product deletion is added in the upcoming delete phase"><Trash2 size={14}/> Delete</button></div></div>

    <div className="detail-grid">
      <section className="detail-card gallery-card" aria-label="Product image gallery">
        <div className="main-product-image">{mainImage ? <img src={mainImage} alt={product.title} onError={event => { event.currentTarget.style.display = 'none' }}/> : null}<div className="image-fallback"><ImageOff size={30}/><span>Product image unavailable</span></div></div>
        {galleryImages.length > 0 && <div className="thumbnail-strip" aria-label="Choose product image">{galleryImages.map((image, index) => <button key={`${image}-${index}`} className={`gallery-thumb ${selectedImage === index ? 'gallery-thumb-active' : ''}`} onClick={() => setSelectedImage(index)} aria-label={`Show product image ${index + 1}`} aria-pressed={selectedImage === index}><img src={image} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/><Package size={15}/></button>)}</div>}
      </section>

      <section className="detail-card info-card">
        <div className="detail-topline"><span className="detail-category">{product.category.replaceAll('-', ' ')}</span><span className={`status status-${availabilityClass}`}><i/>{product.availabilityStatus}</span></div>
        <p className="detail-description">{product.description}</p>
        <div className="price-block"><strong>{currency(product.price)}</strong>{product.discountPercentage > 0 && <span className="discount-badge">{product.discountPercentage.toFixed(1)}% off list price</span>}</div>
        {product.discountPercentage > 0 && <p className="original-price">List price <del>{currency(product.price / (1 - product.discountPercentage / 100))}</del></p>}
        <div className="detail-separator"/>
        <div className="inventory-summary"><div className="inventory-icon"><Box size={17}/></div><div><strong>{product.stock} units</strong><span>Current stock level</span></div><span className={`inventory-status inventory-${availabilityClass}`}><i/>{product.availabilityStatus}</span></div>
        <div className="detail-separator"/>
        <div className="detail-attributes"><DetailAttribute label="Brand" value={product.brand || 'Not specified'}/><DetailAttribute label="SKU" value={product.sku || 'Not specified'}/><DetailAttribute label="Category" value={product.category.replaceAll('-', ' ')}/><DetailAttribute label="Minimum order" value={product.minimumOrderQuantity ? `${product.minimumOrderQuantity} units` : 'Not specified'}/></div>
        <div className="detail-rating"><div><Star size={15} fill="currentColor"/><strong>{product.rating.toFixed(1)}</strong><span> product rating</span></div><span>{product.reviews?.length ?? 0} reviews</span></div>
      </section>
    </div>

    <div className="detail-lower-grid">
      <section className="detail-card additional-card"><div className="detail-section-heading"><div><h2>Product information</h2><p>Specifications and policies</p></div><Package size={17}/></div><div className="spec-list"><DetailAttribute label="Weight" value={product.weight ? `${product.weight} g` : 'Not specified'}/><DetailAttribute label="Dimensions" value={product.dimensions ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm` : 'Not specified'}/><DetailAttribute label="Warranty" value={product.warrantyInformation || 'Not specified'}/><DetailAttribute label="Return policy" value={product.returnPolicy || 'Not specified'}/><DetailAttribute label="Shipping" value={product.shippingInformation || 'Not specified'}/></div></section>
      <section className="detail-card quick-facts"><div className="detail-section-heading"><div><h2>Inventory notes</h2><p>Fulfillment at a glance</p></div><Truck size={17}/></div><div className="fact-row"><div className="fact-icon"><Truck size={15}/></div><div><strong>{product.shippingInformation || 'Standard shipping'}</strong><span>Shipping</span></div><Check size={15} className="fact-check"/></div><div className="fact-row"><div className="fact-icon"><ShieldCheck size={15}/></div><div><strong>{product.warrantyInformation || 'No warranty details'}</strong><span>Warranty coverage</span></div><Check size={15} className="fact-check"/></div><Link className="catalog-link" to="/products">View all products <ArrowUpRight size={14}/></Link></section>
    </div>
  </div>
}

/** Render product attributes with shared label/value alignment. */
function DetailAttribute({ label, value }: { label: string; value: string }) {
  return <div className="detail-attribute"><span>{label}</span><strong>{value}</strong></div>
}

/** Give invalid, missing, and failed product requests the same clear recovery layout. */
function DetailState({ title, message, retry }: { title: string; message: string; retry?: () => void }) {
  return <div className="page-content detail-page"><Link className="back-link" to="/products"><ArrowLeft size={15}/> Back to products</Link><div className="detail-state"><CircleAlert size={26}/><h1>{title}</h1><p>{message}</p>{retry && <button className="secondary-button" onClick={retry}>Try again</button>}</div></div>
}

/** Preserve page structure while the detail request is loading. */
function DetailsSkeleton() {
  return <div className="page-content detail-page"><div className="back-link-skeleton"/><div className="detail-heading-skeleton"/><div className="detail-grid"><div className="detail-card detail-skeleton-image"/><div className="detail-card detail-skeleton-info"/></div></div>
}
