import { useState } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight, Bell, Box, ChevronLeft,
  ChevronRight, CircleHelp, CreditCard, LayoutDashboard,
  Eye, LogOut, Menu, MoreHorizontal, Package, Plus, Settings, ShoppingBag,
  Tag, Users, X,
} from 'lucide-react'
import ProductsPage from './features/products/components/ProductsPage'
import ProductDetailsPage from './features/products/components/ProductDetailsPage'
import ProductFormPage from './features/products/components/ProductFormPage'
import { useProducts, useProductCategories } from './features/products/hooks/useProducts'
import type { Product } from './features/products/types/product'
import UsersPage from './features/users/components/UsersPage'
import LoginPage from './features/auth/components/LoginPage'
import { AuthLanding, PublicOnly, RequireAuth } from './features/auth/guards'
import { useAuth } from './features/auth/useAuth'
import { useAuthorization } from './features/auth/useAuthorization'
import './features/auth/session.css'
import { CartProvider } from './features/storefront/CartContext'
import StorefrontLayout from './features/storefront/components/StorefrontLayout'
import { AccountPage, CartPage, CheckoutPage, OrdersPage, ShopHomePage, ShopProductDetailsPage, ShopProductsPage } from './features/storefront/components/StorefrontPages'
import CategoryManagementPage from './features/categories/components/CategoryManagementPage'
import AdminSettingsPage from './features/settings/components/AdminSettingsPage'
import './features/categories/components/categories.css'
import './features/settings/components/settings.css'

// Keep route metadata in one list so sidebar links stay consistent as sections grow.
const navigation = [
  { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard, adminOnly: false },
  { label: 'Products', path: '/admin/products', icon: Package, adminOnly: false },
  { label: 'Categories', path: '/admin/categories', icon: Tag, adminOnly: true },
  { label: 'Users & roles', path: '/admin/users', icon: Users, adminOnly: true },
]

// Sidebar owns only navigation presentation; the shell controls its collapsed and mobile states.
function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: {
  collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onClose: () => void
}) {
  const { user } = useAuth()
  const { appRole } = useAuthorization()
  const productsQuery = useProducts('')
  return <>
    {mobileOpen && <button aria-label="Close navigation overlay" className="sidebar-overlay" onClick={onClose} />}
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark"><Box size={19} strokeWidth={2.4} /></div>
        {!collapsed && <div className="brand-name">Stockroom<span>STUDIO</span></div>}
        <button className="icon-button collapse-button" aria-label="Collapse sidebar" onClick={onToggle}><ChevronLeft size={17} /></button>
        <button className="icon-button mobile-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="nav-section-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.filter(item => !item.adminOnly || appRole === 'ADMIN').map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/admin/dashboard'} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
          <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Products' && !collapsed && <span className="nav-count">{productsQuery.data?.products.length ?? '—'}</span>}
        </NavLink>)}
        {appRole === 'ADMIN' && <NavLink to="/admin/settings" onClick={onClose} title={collapsed ? 'Settings' : undefined} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}><Settings size={18} strokeWidth={1.8} /><span>Settings</span></NavLink>}
      </nav>
      <div className="sidebar-bottom">
        <Link className="nav-link support-link" to={appRole === 'ADMIN' ? '/admin/settings' : '/admin/products'} title={collapsed ? 'Help & settings' : undefined}><CircleHelp size={18} /><span>Help & settings</span></Link>
        <Link className="profile-row sidebar-profile-link" to="/account" title="View your full profile"><div className="profile-avatar">{user?.image ? <img src={user.image} alt=""/> : `${user?.firstName[0] ?? ''}${user?.lastName[0] ?? ''}`}</div>{!collapsed && <div className="profile-copy"><strong>{user ? `${user.firstName} ${user.lastName}` : 'Signed out'}</strong><span>{user?.email ?? 'No active session'}</span></div>}</Link>
      </div>
    </aside>
  </>
}

// The top bar receives its current route title so it remains independent of route definitions.
function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { user, logout } = useAuth()
  const { appRole } = useAuthorization()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const productsQuery = useProducts('')
  const attentionProducts = productsQuery.data?.products.filter(product => product.stock <= 10) ?? []
  return <header className="topbar">
    <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button>
    <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div>
    <div className="topbar-actions"><a className="storefront-preview-link" href="/shop" target="_blank" rel="noreferrer" aria-label="Open storefront in a new tab"><Eye size={15}/><span>View storefront</span><ArrowUpRight size={13}/></a><button className="icon-button top-help" aria-label="Help and settings" title="Help and settings" onClick={() => navigate(appRole === 'ADMIN' ? '/admin/settings' : '/admin/products')}><CircleHelp size={18} /></button><div className="notification-wrap"><button className="notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(open => !open)}><Bell size={18} />{attentionProducts.length > 0 && <i />}</button>{notificationsOpen && <section className="notification-popover" aria-label="Product notifications"><strong>Catalog alerts</strong>{productsQuery.isPending ? <p>Checking stock…</p> : productsQuery.isError ? <p>Catalog alerts are unavailable.</p> : attentionProducts.length ? <><p>{attentionProducts.length} product{attentionProducts.length === 1 ? '' : 's'} have 10 or fewer units.</p>{attentionProducts.slice(0, 3).map(product => <Link key={product.id} to={`/admin/products/${product.id}`} onClick={() => setNotificationsOpen(false)}><span>{product.title}</span><b>{product.stock} left</b></Link>)}<Link className="notification-all" to="/admin/products" onClick={() => setNotificationsOpen(false)}>Open product catalog</Link></> : <p>All products are above the low stock threshold.</p>}</section>}</div><div className="topbar-divider" /><div className="top-profile"><Link className="top-profile-identity" to="/account" title="View your full profile"><span className="profile-avatar">{user?.image ? <img src={user.image} alt=""/> : `${user?.firstName[0] ?? ''}${user?.lastName[0] ?? ''}`}</span><span className="top-profile-name">{user ? `${user.firstName} ${user.lastName}` : ''}</span></Link><button className="icon-button logout-button" aria-label="Sign out" title="Sign out" onClick={() => { logout(); navigate('/login', { replace: true }) }}><LogOut size={16}/></button></div></div>
  </header>
}

function Dashboard() {
  const { user } = useAuth()
  const { appRole } = useAuthorization()
  const productsQuery = useProducts('')
  const categoriesQuery = useProductCategories()
  const products = productsQuery.data?.products ?? []
  const productCount = productsQuery.isPending || productsQuery.isError ? '—' : String(products.length)
  const categoryCount = categoriesQuery.isPending || categoriesQuery.isError ? '—' : String(categoriesQuery.data?.length ?? 0)
  const averagePrice = products.length ? products.reduce((sum, product) => sum + product.price, 0) / products.length : 0
  const lowStockCount = products.filter(product => product.stock <= 10).length
  const totalStockUnits = products.reduce((sum, product) => sum + product.stock, 0)
  const stockGroups = [
    { label: 'Healthy stock', count: products.filter(product => product.stock > 10).length, color: '#6d8d76' },
    { label: 'Low stock', count: products.filter(product => product.stock > 0 && product.stock <= 10).length, color: '#c69b61' },
    { label: 'Out of stock', count: products.filter(product => product.stock <= 0).length, color: '#bd806e' },
  ]
  const recentProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 4)
  const categoryColors = ['#6d8d76', '#a3b7a6', '#d5dfd6', '#e8eee9']
  const categoryBreakdown = (categoriesQuery.data ?? []).map(category => ({ label: category.name, value: products.filter(product => product.category === category.slug).length })).filter(category => category.value > 0).sort((a, b) => b.value - a.value).slice(0, 4)
  let categoryOffset = 0
  const categoryGradient = categoryBreakdown.length ? `conic-gradient(${categoryBreakdown.map((item, index) => { const start = categoryOffset; categoryOffset += products.length ? item.value / products.length * 100 : 0; return `${categoryColors[index]} ${start}% ${categoryOffset}%` }).join(',')})` : '#e8eee9'
  if (appRole !== 'ADMIN') return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">WORKSPACE</div><h1>Welcome, {user?.firstName}</h1><p>Browse the product catalog and review product details.</p></div></div><section className="panel"><div className="panel-heading"><div><h2>Product catalog</h2><p>View products and their current catalog details.</p></div><Link className="text-button" to="/admin/products">Browse products <ArrowUpRight size={14}/></Link></div></section></div>
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}</div><h1>Good morning, {user?.firstName ?? 'there'} <span>✳</span></h1><p>Here’s what’s happening with your store today.</p></div><Link className="primary-button" to="/admin/products/create"><Plus size={17} /> Add product</Link></div>
    <div className="stats-grid">
      <StatCard label="Total products" value={productCount} note="Products available" icon={ShoppingBag} />
      <StatCard label="Total categories" value={categoryCount} note="Product categories" icon={Tag} />
      <StatCard label="Average product price" value={productsQuery.isPending || productsQuery.isError ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(averagePrice)} note="Across the current catalog" icon={CreditCard} />
      <StatCard label="Low stock products" value={productsQuery.isPending || productsQuery.isError ? '—' : String(lowStockCount)} note="10 or fewer units" icon={Users} />
    </div>
    <div className="dashboard-grid">
      <section className="panel revenue-panel"><div className="panel-heading"><div><h2>Inventory overview</h2><p>Stock levels in the current product catalog</p></div><span className="neutral-pill">Live catalog</span></div>
        <div className="revenue-summary"><strong>{productsQuery.isPending || productsQuery.isError ? '—' : totalStockUnits.toLocaleString()}</strong><small>Total units in stock</small></div>
        <div className="inventory-breakdown">{stockGroups.map(group => <div className="inventory-breakdown-row" key={group.label}><div><span>{group.label}</span><strong>{productsQuery.isPending || productsQuery.isError ? '—' : group.count}</strong></div><span className="inventory-track"><i style={{ width: `${products.length ? group.count / products.length * 100 : 0}%`, backgroundColor: group.color }}/></span></div>)}</div>
      </section>
      <section className="panel category-panel"><div className="panel-heading"><div><h2>Products by category</h2><p>Current catalog breakdown</p></div><Link className="text-button" to="/admin/categories" aria-label="Manage categories"><MoreHorizontal size={19}/></Link></div><div className="donut-wrap"><div className="donut" style={{ background: categoryGradient }}><div><strong>{productCount}</strong><span>products</span></div></div><div className="category-legend">{categoryBreakdown.map((category, index) => <Legend key={category.label} color={categoryColors[index]} label={category.label} value={`${products.length ? Math.round(category.value / products.length * 100) : 0}%`}/>)}</div></div></section>
    </div>
    <section className="panel products-panel"><div className="panel-heading"><div><h2>Recently added</h2><p>Latest products in your catalog</p></div><Link className="text-button" to="/admin/products">View all products <ArrowUpRight size={14} /></Link></div><div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th /></tr></thead><tbody>{productsQuery.isPending ? <tr><td colSpan={6}>Loading products…</td></tr> : productsQuery.isError ? <tr><td colSpan={6}>Could not load products. <button className="text-button" onClick={() => void productsQuery.refetch()}>Retry</button></td></tr> : recentProducts.map(product => <DashboardProductRow product={product} key={product.id}/>)}</tbody></table></div><div className="table-footer"><span>Showing <strong>{recentProducts.length}</strong> of <strong>{productCount}</strong> products</span></div></section>
  </div>
}

function DashboardProductRow({ product }: { product: Product }) {
  const availability = product.stock <= 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'In Stock'
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)
  return <tr><td><Link className="product-name-cell dashboard-product-link" to={`/admin/products/${product.id}`}><div className="product-thumb"><img src={product.thumbnail || product.images[0]} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/><Package size={16}/></div><div><strong>{product.title}</strong><span>{product.sku || `Product #${product.id}`}</span></div></Link></td><td>{product.category.replaceAll('-', ' ')}</td><td className="price-cell">{price}</td><td>{product.stock}</td><td><span className={`status status-${availability.toLowerCase().replaceAll(' ', '-')}`}><i/>{availability}</span></td><td><Link className="icon-button row-more" to={`/admin/products/${product.id}`} aria-label={`View ${product.title}`}><MoreHorizontal size={18}/></Link></td></tr>
}

// A single summary card component ensures metric cards share layout and status styling.
function StatCard({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof Package }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17} strokeWidth={1.8}/></div></div><div className="stat-bottom"><strong>{value}</strong><span className="stat-note">{note}</span></div></article>
}
// Shared legend rows keep chart labels aligned with their category color and share.
function Legend({ color, label, value }: { color: string; label: string; value: string }) { return <div className="legend-row"><i style={{ backgroundColor: color }}/><span>{label}</span><strong>{value}</strong></div> }

// The admin layout shares its navigation chrome while nested route elements stay explicit at the top level.
function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const section = location.pathname.split('/')[2]
  const title = section === 'dashboard' ? 'Overview' : section ? section.replace(/^./, char => char.toUpperCase()) : 'Overview'
  return <div className="app-shell"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/><main className="main-area"><Topbar title={title} onMenu={() => setMobileOpen(true)}/><Outlet/><footer className="app-footer"><span>© 2026 Stockroom Studio</span><span><a href="#">Privacy</a><a href="#">Help center</a><span className="footer-status"><i/> All systems operational</span></span></footer></main></div>
}

// BrowserRouter owns one explicit nested route tree so guards, layouts, and direct URLs agree.
export default function App() {
  return <BrowserRouter><CartProvider><Routes>
    <Route path="/login" element={<PublicOnly><LoginPage/></PublicOnly>}/>
    <Route path="/admin" element={<RequireAuth roles={['ADMIN', 'MODERATOR']}><Navigate to="/admin/dashboard" replace/></RequireAuth>}/>
    <Route element={<RequireAuth roles={['ADMIN', 'MODERATOR']}><AdminLayout/></RequireAuth>}>
      <Route path="/admin/dashboard" element={<Dashboard/>}/>
      <Route path="/admin/products" element={<ProductsPage/>}/>
      <Route path="/admin/products/create" element={<RequireAuth roles={['ADMIN']}><ProductFormPage/></RequireAuth>}/>
      <Route path="/admin/products/:productId/edit" element={<RequireAuth roles={['ADMIN']}><ProductFormPage/></RequireAuth>}/>
      <Route path="/admin/products/:productId" element={<ProductDetailsPage/>}/>
      <Route path="/admin/categories" element={<RequireAuth roles={['ADMIN']}><CategoryManagementPage/></RequireAuth>}/>
      <Route path="/admin/users" element={<RequireAuth roles={['ADMIN']}><UsersPage/></RequireAuth>}/>
      <Route path="/admin/settings" element={<RequireAuth roles={['ADMIN']}><AdminSettingsPage/></RequireAuth>}/>
    </Route>
    <Route element={<RequireAuth><StorefrontLayout/></RequireAuth>}>
      <Route path="/shop" element={<ShopHomePage/>}/>
      <Route path="/shop/products" element={<ShopProductsPage/>}/>
      <Route path="/shop/products/:productId" element={<ShopProductDetailsPage/>}/>
      <Route path="/cart" element={<CartPage/>}/>
      <Route path="/checkout" element={<CheckoutPage/>}/>
      <Route path="/account" element={<AccountPage/>}/>
      <Route path="/account/orders" element={<OrdersPage/>}/>
    </Route>
    <Route path="/" element={<AuthLanding/>}/>
    <Route path="*" element={<AuthLanding/>}/>
  </Routes></CartProvider></BrowserRouter>
}
