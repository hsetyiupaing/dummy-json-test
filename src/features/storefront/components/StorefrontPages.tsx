import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, CircleAlert, Minus, Package, Plus, Search, ShoppingBag, Star, Trash2, Truck, UserRound } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { useAuthorization } from '../../auth/useAuthorization'
import { useProduct, useProductCategories, useProducts } from '../../products/hooks/useProducts'
import type { Product } from '../../products/types/product'
import { useCart } from '../CartContext'
import type { CartLine, DemoOrder } from '../types'
import { storefrontOrdersKey, readOrders, saveOrder } from '../orderStorage'

/** Format store prices in USD using the same precision throughout checkout and cart. */
function money(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

/** Resolve a product image with a plain fallback when the API image is unavailable. */
function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  return <div className={`shop-product-image ${className}`}><img src={product.thumbnail || product.images?.[0]} alt={product.title} loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }}/><Package size={22}/></div>
}

/** Render an API-backed product card with discount, rating, and cart action. */
function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  return <article className="shop-product-card"><Link to={`/shop/products/${product.id}`} className="shop-product-link"><ProductImage product={product}/>{product.discountPercentage > 0 && <span className="shop-discount">-{Math.round(product.discountPercentage)}%</span>}<div className="shop-product-copy"><span className="shop-category-label">{product.category.replaceAll('-', ' ')}</span><h3>{product.title}</h3><div className="shop-card-rating"><Star size={13} fill="currentColor"/> {product.rating.toFixed(1)}</div><strong>{money(product.price)}</strong></div></Link><button className="shop-add-button" onClick={() => addItem(product)}><Plus size={15}/> Add to cart</button></article>
}

/** Show the home, featured selection, actual categories, best-rated products, and recent records. */
export function ShopHomePage() {
  const productsQuery = useProducts('')
  const categoriesQuery = useProductCategories()
  const products = productsQuery.data?.products ?? []
  const featured = products.filter(product => product.discountPercentage > 0).slice(0, 4)
  const popular = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4)
  const arrivals = [...products].sort((a, b) => (b.meta?.createdAt ?? '').localeCompare(a.meta?.createdAt ?? '')).slice(0, 4)
  return <main>
    <section className="shop-hero"><div className="shop-hero-copy"><span>THE STOCKROOM EDIT</span><h1>Good finds.<br/>Made for real life.</h1><p>Discover useful everyday pieces, picked from a catalog of products for every room and routine.</p><Link className="shop-primary-link" to="/shop/products">Explore the collection <ArrowRight size={16}/></Link></div><div className="shop-hero-image"><Package size={38}/><img src={featured[0]?.thumbnail ?? products[0]?.thumbnail ?? ''} alt={featured[0]?.title ?? 'Featured product selection'} onError={event => { event.currentTarget.style.display = 'none' }}/><div className="hero-note"><span>Featured find</span><strong>{featured[0]?.title ?? products[0]?.title ?? 'Explore the catalog'}</strong>{featured[0] && <small>{Math.round(featured[0].discountPercentage)}% off · {money(featured[0].price)}</small>}</div></div></section>
    <section className="shop-section"><div className="shop-section-heading"><div><span>EXPLORE</span><h2>Shop by category</h2></div><Link to="/shop/products">All products <ArrowRight size={15}/></Link></div>{categoriesQuery.isPending ? <p className="shop-inline-state">Loading categories…</p> : categoriesQuery.isError ? <p className="shop-inline-error">Categories could not be loaded. <button onClick={() => void categoriesQuery.refetch()}>Retry</button></p> : <div className="category-tiles">{categoriesQuery.data?.slice(0, 8).map(category => { const sample = products.find(product => product.category === category.slug); return <Link key={category.slug} to={`/shop/products?category=${encodeURIComponent(category.slug)}`} className="category-tile"><span className="category-tile-image"><Package size={20}/>{sample && <img src={sample.thumbnail} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/>}</span><strong>{category.name}</strong><small>Explore collection</small></Link> })}</div>}</section>
    <ProductSection title="Featured products" eyebrow="SELECTED FOR YOU" products={featured} isLoading={productsQuery.isPending} error={productsQuery.isError} retry={() => void productsQuery.refetch()} empty="No discounted products are listed right now."/>
    <ProductSection title="Popular right now" eyebrow="CUSTOMER FAVORITES" products={popular} isLoading={productsQuery.isPending} error={productsQuery.isError} retry={() => void productsQuery.refetch()} empty="Popular products will appear here."/>
    <ProductSection title="New arrivals" eyebrow="FRESH FINDS" products={arrivals} isLoading={productsQuery.isPending} error={productsQuery.isError} retry={() => void productsQuery.refetch()} empty="No recent products are available."/>
    <section className="shop-promo"><div><span>A LITTLE INSPIRATION</span><h2>Make room for something useful.</h2><p>Browse the full collection and find the right fit for your everyday.</p></div><Link to="/shop/products">Shop the catalog <ArrowRight size={16}/></Link></section>
  </main>
}

/** Keep each home assortment labeled and resilient to loading or missing API data. */
function ProductSection({ title, eyebrow, products, isLoading, error, retry, empty }: { title: string; eyebrow: string; products: Product[]; isLoading: boolean; error: boolean; retry: () => void; empty: string }) {
  return <section className="shop-section"><div className="shop-section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div><Link to="/shop/products">View all <ArrowRight size={15}/></Link></div>{isLoading ? <div className="shop-loading-grid">{Array.from({ length: 4 }, (_, index) => <i key={index}/>)}</div> : error ? <div className="shop-inline-error">Products could not be loaded. <button onClick={retry}>Retry</button></div> : products.length ? <div className="shop-product-grid">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <p className="shop-inline-state">{empty}</p>}</section>
}

/** Search, filter, sort, paginate, and add real DummyJSON catalog products to the user cart. */
export function ShopProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [input, setInput] = useState(query)
  const category = searchParams.get('category') ?? 'all'
  const sort = searchParams.get('sort') ?? 'featured'
  const [page, setPage] = useState(1)
  const pageSize = 12
  const productsQuery = useProducts(query)
  const categoriesQuery = useProductCategories()
  const sorted = useMemo(() => {
    const list = (productsQuery.data?.products ?? []).filter(product => category === 'all' || product.category === category)
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [productsQuery.data, category, sort])
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)

  // Query parameters keep searches and selected categories shareable as direct URLs.
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (input.trim()) next.set('q', input.trim())
    else next.delete('q')
    setSearchParams(next)
    setPage(1)
  }

  return <main className="shop-page"><div className="shop-breadcrumb"><Link to="/shop">Home</Link> / Shop all</div><div className="shop-page-heading"><div><span>THE FULL COLLECTION</span><h1>Shop all products</h1><p>Search the current catalog and discover something useful.</p></div><span className="shop-result-count">{productsQuery.data?.total ?? '—'} products</span></div><div className="catalog-controls"><form className="catalog-search shop-search" onSubmit={submitSearch}><Search size={16}/><input value={input} onChange={event => setInput(event.target.value)} placeholder="Search products" aria-label="Search products"/><button className="search-submit">Search</button></form><label><span>Category</span><select value={category} onChange={event => {const next = new URLSearchParams(searchParams); if (event.target.value === 'all') next.delete('category'); else next.set('category', event.target.value); setSearchParams(next); setPage(1)}}><option value="all">All categories</option>{categoriesQuery.data?.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label><label><span>Sort by</span><select value={sort} onChange={event => {const next = new URLSearchParams(searchParams); if (event.target.value === 'featured') next.delete('sort'); else next.set('sort', event.target.value); setSearchParams(next)}}><option value="featured">Featured</option><option value="rating">Top rated</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>{productsQuery.isPending ? <div className="shop-loading-grid">{Array.from({ length: 8 }, (_, index) => <i key={index}/>)}</div> : productsQuery.isError ? <div className="shop-state"><CircleAlert size={25}/><h2>Products are unavailable</h2><p>{productsQuery.error.message}</p><button className="shop-primary-link" onClick={() => void productsQuery.refetch()}>Try again</button></div> : visible.length ? <><div className="shop-product-grid shop-catalog-grid">{visible.map(product => <ProductCard key={product.id} product={product}/>)}</div><div className="shop-pagination"><span>Page {page} of {pageCount}</span><button disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><button disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>Next</button></div></> : <div className="shop-state"><Package size={26}/><h2>No products found</h2><p>Try changing your search or category.</p><button className="shop-secondary-button" onClick={() => {setInput('');setSearchParams({});setPage(1)}}>Clear filters</button></div>}</main>
}

/** Display one actual product record, choose quantity, and add it to the authenticated cart. */
export function ShopProductDetailsPage() {
  const { productId } = useParams()
  const productQuery = useProduct(Number(productId))
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const product = productQuery.data
  if (productQuery.isPending) return <main className="shop-page"><p className="shop-inline-state">Loading product…</p></main>
  if (productQuery.isError || !product) return <main className="shop-page shop-state"><CircleAlert size={26}/><h1>Product unavailable</h1><p>This product could not be loaded from the catalog.</p><Link className="shop-primary-link" to="/shop/products">Back to shop</Link></main>
  return <main className="shop-page"><div className="shop-breadcrumb"><Link to="/shop">Home</Link> / <Link to="/shop/products">Shop</Link> / {product.title}</div><div className="shop-detail"><div className="shop-detail-image"><img src={product.images?.[0] ?? product.thumbnail} alt={product.title}/>{product.discountPercentage > 0 && <span className="shop-discount">-{Math.round(product.discountPercentage)}%</span>}</div><div className="shop-detail-copy"><span className="shop-category-label">{product.category.replaceAll('-', ' ')}</span><h1>{product.title}</h1><div className="shop-card-rating"><Star size={15} fill="currentColor"/> {product.rating.toFixed(1)} <span>· {product.availabilityStatus}</span></div><strong className="shop-detail-price">{money(product.price)}</strong><p>{product.description}</p>{product.brand && <p><b>Brand:</b> {product.brand}</p>}<p><Truck size={16}/> {product.shippingInformation}</p><div className="shop-buy-row"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={14}/></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(value => Math.min(99, value + 1))}><Plus size={14}/></button></div><button className="shop-primary-link" onClick={() => addItem(product, quantity)}><ShoppingBag size={16}/> Add to cart</button></div><Link className="shop-text-link" to="/shop/products"><ArrowLeft size={14}/> Continue browsing</Link></div></div></main>
}

/** Summarize the user-scoped sample or locally adjusted cart with editable quantities. */
export function CartPage() {
  const cart = useCart()
  const shipping = cart.subtotal >= 75 || cart.subtotal === 0 ? 0 : 5.99
  if (cart.isLoading) return <main className="shop-page"><p className="shop-inline-state">Loading your cart…</p></main>
  return <main className="shop-page"><div className="shop-breadcrumb"><Link to="/shop">Home</Link> / Your cart</div><div className="shop-page-heading"><div><span>YOUR SELECTION</span><h1>Shopping cart</h1><p>{cart.itemCount} items in your cart</p></div></div>{cart.error && cart.items.length === 0 && <div className="shop-inline-error">Could not load the sample cart. Add products from the catalog to start a cart.</div>}{cart.items.length === 0 ? <div className="shop-state"><ShoppingBag size={28}/><h2>Your cart is empty</h2><p>Explore the catalog to find something for your home.</p><Link className="shop-primary-link" to="/shop/products">Continue shopping</Link></div> : <div className="cart-layout"><section className="cart-lines">{cart.items.map(item => <CartRow key={item.product.id} item={item} onRemove={() => cart.removeItem(item.product.id)} onQuantity={quantity => cart.setQuantity(item.product.id, quantity)}/>)}</section><aside className="cart-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div><div><span>Delivery</span><strong>{shipping ? money(shipping) : 'Free'}</strong></div><small>Free delivery on demo orders over $75.</small><div className="cart-total"><span>Total</span><strong>{money(cart.subtotal + shipping)}</strong></div><Link className="shop-primary-link" to="/checkout">Continue to checkout <ArrowRight size={15}/></Link><Link className="shop-text-link" to="/shop/products">Continue shopping</Link></aside></div>}</main>
}

/** Keep cart rows responsive and provide accessible quantity and remove controls. */
function CartRow({ item, onRemove, onQuantity }: { item: CartLine; onRemove: () => void; onQuantity: (quantity: number) => void }) {
  return <article className="cart-line"><Link to={`/shop/products/${item.product.id}`} className="cart-line-image"><img src={item.product.thumbnail} alt={item.product.title}/></Link><div className="cart-line-copy"><Link to={`/shop/products/${item.product.id}`}><strong>{item.product.title}</strong></Link><span>{item.product.category.replaceAll('-', ' ')}</span><div className="quantity-control"><button aria-label={`Decrease ${item.product.title} quantity`} onClick={() => onQuantity(item.quantity - 1)}><Minus size={13}/></button><span>{item.quantity}</span><button aria-label={`Increase ${item.product.title} quantity`} onClick={() => onQuantity(item.quantity + 1)}><Plus size={13}/></button></div></div><strong className="cart-line-total">{money(item.product.price * item.quantity)}</strong><button className="cart-remove" aria-label={`Remove ${item.product.title}`} onClick={onRemove}><Trash2 size={16}/></button></article>
}

/** Validate delivery details and persist a clearly marked local demo order on submission. */
export function CheckoutPage() {
  const { user } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const shipping = cart.subtotal >= 75 || cart.subtotal === 0 ? 0 : 5.99
  const [form, setForm] = useState({ name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email ?? '', address: '', city: '', postalCode: '' })

  // Successful checkout creates a browser-stored example order; no payment or server mutation occurs.
  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (cart.items.length === 0) { setError('Add an item to your cart before placing an order.'); return }
    if (!form.name.trim() || !form.email.trim() || !form.address.trim() || !form.city.trim() || !form.postalCode.trim()) { setError('Complete all customer and delivery fields to place your demo order.'); return }
    const order: DemoOrder = { id: `SS-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), status: 'Processing', items: cart.items, subtotal: cart.subtotal, shipping, total: cart.subtotal + shipping, customerName: form.name.trim(), email: form.email.trim(), address: form.address.trim(), city: form.city.trim(), postalCode: form.postalCode.trim() }
    saveOrder(user!.id, order)
    queryClient.setQueryData<DemoOrder[]>([storefrontOrdersKey, user!.id], orders => [order, ...(orders ?? [])])
    cart.clearCart()
    navigate('/account/orders', { replace: true })
  }

  return <main className="shop-page"><div className="shop-breadcrumb"><Link to="/cart">Cart</Link> / Checkout</div><div className="shop-page-heading"><div><span>DEMO CHECKOUT</span><h1>Delivery details</h1><p>Review your order and enter where it should be delivered.</p></div></div><div className="checkout-layout"><form className="checkout-form" onSubmit={placeOrder}><section><h2><UserRound size={17}/> Customer information</h2><label>Full name<input required autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/></label><label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/></label></section><section><h2><Truck size={17}/> Delivery address</h2><label>Street address<input required autoComplete="street-address" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })}/></label><div className="checkout-field-row"><label>City<input required autoComplete="address-level2" value={form.city} onChange={event => setForm({ ...form, city: event.target.value })}/></label><label>Postal code<input required autoComplete="postal-code" value={form.postalCode} onChange={event => setForm({ ...form, postalCode: event.target.value })}/></label></div></section>{error && <p className="checkout-error" role="alert">{error}</p>}<p className="demo-checkout-note">Demo checkout only. No payment is collected and the order is saved in this browser.</p><button className="shop-primary-link" type="submit"><Check size={16}/> Place demo order</button></form><aside className="cart-summary"><h2>Order summary</h2>{cart.items.length ? cart.items.map(item => <div className="checkout-order-item" key={item.product.id}><span>{item.product.title} × {item.quantity}</span><strong>{money(item.product.price * item.quantity)}</strong></div>) : <p className="shop-inline-state">Your cart is empty.</p>}<div><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div><div><span>Delivery</span><strong>{shipping ? money(shipping) : 'Free'}</strong></div><div className="cart-total"><span>Total</span><strong>{money(cart.subtotal + shipping)}</strong></div><Link className="shop-text-link" to="/cart">Edit cart</Link></aside></div></main>
}

/** Show the signed-in user's real API profile and persisted demo order count. */
export function AccountPage() {
  const { user } = useAuth()
  const { appRole } = useAuthorization()
  const { data: orders = [] } = useQuery({ queryKey: [storefrontOrdersKey, user?.id], queryFn: () => readOrders(user!.id), enabled: Boolean(user) })
  return <main className="shop-page"><div className="shop-page-heading"><div><span>YOUR PROFILE</span><h1>My account</h1><p>Profile details from your authenticated DummyJSON account.</p></div>{(appRole === 'ADMIN' || appRole === 'MODERATOR') && <Link className="shop-primary-link" to="/admin/dashboard">Return to admin dashboard</Link>}</div><section className="account-profile"><img src={user?.image} alt=""/><div><span>Signed-in {appRole === 'ADMIN' || appRole === 'MODERATOR' ? appRole.toLowerCase() : 'customer'}</span><h2>{user?.firstName} {user?.lastName}</h2><p>{user?.email}</p><small>Username: {user?.username} · API user #{user?.id}{user?.gender ? ` · Gender: ${user.gender}` : ''}</small></div></section><section className="account-links"><Link to="/account/orders"><ShoppingBag size={18}/><span><strong>Order history</strong><small>{orders.length} locally saved demo orders</small></span><ArrowRight size={17}/></Link><Link to="/shop/products"><Package size={18}/><span><strong>Browse products</strong><small>Explore the current catalog</small></span><ArrowRight size={17}/></Link></section></main>
}

/** Render only real orders the authenticated account placed in this browser. */
export function OrdersPage() {
  const { user } = useAuth()
  const { data: orders = [], isLoading } = useQuery({ queryKey: [storefrontOrdersKey, user?.id], queryFn: () => readOrders(user!.id), enabled: Boolean(user) })
  return <main className="shop-page"><div className="shop-breadcrumb"><Link to="/account">My account</Link> / Orders</div><div className="shop-page-heading"><div><span>YOUR PURCHASES</span><h1>Order history</h1><p>Demo orders are saved locally to this browser.</p></div></div>{isLoading ? <p className="shop-inline-state">Loading order history…</p> : orders.length === 0 ? <div className="shop-state"><Package size={28}/><h2>No orders yet</h2><p>When you place a demo order, it will appear here.</p><Link className="shop-primary-link" to="/shop/products">Start shopping</Link></div> : <div className="orders-list">{orders.map(order => <article className="order-card" key={order.id}><div className="order-card-heading"><div><span>ORDER {order.id}</span><h2>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(order.createdAt))}</h2></div><span className="order-status">{order.status}</span></div><div className="order-card-items">{order.items.map(item => <div key={item.product.id}><img src={item.product.thumbnail} alt=""/><span>{item.product.title} × {item.quantity}</span><strong>{money(item.product.price * item.quantity)}</strong></div>)}</div><div className="order-card-total"><span>Delivered to {order.customerName} · {order.city}</span><strong>Total {money(order.total)}</strong></div></article>)}</div>}</main>
}
