import { useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  ArrowDownRight, ArrowUpRight, Bell, Box, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, CreditCard, LayoutDashboard, LifeBuoy,
  Menu, MoreHorizontal, Package, Plus, Search, Settings, ShoppingBag,
  SlidersHorizontal, Sparkles, Tag, Users, X,
} from 'lucide-react'
import ProductsPage from './features/products/components/ProductsPage'
import ProductDetailsPage from './features/products/components/ProductDetailsPage'
import UsersPage from './features/users/components/UsersPage'
import { PermissionGate } from './features/users/rbac'
import { useDemoRole } from './features/users/useDemoRole'
import './features/users/rbac.css'

// Keep route metadata in one list so sidebar links stay consistent as sections grow.
const navigation = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: Tag },
  { label: 'Users & roles', path: '/users', icon: Users },
]

// Sidebar owns only navigation presentation; the shell controls its collapsed and mobile states.
function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: {
  collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onClose: () => void
}) {
  return <>
    {mobileOpen && <button aria-label="Close navigation overlay" className="sidebar-overlay" onClick={onClose} />}
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark"><Box size={19} strokeWidth={2.4} /></div>
        {!collapsed && <div className="brand-name">Stockroom<span>STUDIO</span></div>}
        <button className="icon-button collapse-button" aria-label="Collapse sidebar" onClick={onToggle}><ChevronLeft size={17} /></button>
        <button className="icon-button mobile-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="workspace-switch">
        <div className="workspace-avatar">S</div>
        {!collapsed && <><div className="workspace-copy"><strong>Studio North</strong><span>Workspace</span></div><ChevronDown size={15} /></>}
      </div>
      <div className="nav-section-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
          <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Products' && !collapsed && <span className="nav-count">248</span>}
        </NavLink>)}
        <NavLink to="/settings" onClick={onClose} title={collapsed ? 'Settings' : undefined} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}><Settings size={18} strokeWidth={1.8} /><span>Settings</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        {!collapsed && <div className="plan-card"><div className="plan-icon"><Sparkles size={15} /></div><strong>Free plan</strong><span>Unlock more with a Pro plan.</span><button>Explore plans <ArrowUpRight size={13} /></button><div className="plan-progress"><i /></div><small>2 of 5 team members</small></div>}
        <button className="nav-link support-link" title={collapsed ? 'Help & support' : undefined}><CircleHelp size={18} /><span>Help & support</span></button>
        <div className="profile-row"><div className="profile-avatar">DM</div>{!collapsed && <><div className="profile-copy"><strong>Demo member</strong><span>Role preview only</span></div><MoreHorizontal size={18} /></>}</div>
      </div>
    </aside>
  </>
}

// The top bar receives its current route title so it remains independent of route definitions.
function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { role, setRole } = useDemoRole()
  return <header className="topbar">
    <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button>
    <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div>
    <div className="topbar-actions"><label className="demo-role-switch"><span>Demo access</span><select aria-label="Choose demo role" value={role} onChange={event => setRole(event.target.value as 'admin' | 'moderator' | 'user')}><option value="admin">Admin</option><option value="moderator">Moderator</option><option value="user">User</option></select><ChevronDown size={12}/></label><button className="search-shortcut"><Search size={15} /><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-button top-help" aria-label="Help"><LifeBuoy size={18} /></button><button className="notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="top-profile" aria-label="Demo member profile"><span className="profile-avatar">DM</span><ChevronDown size={14} /></button></div>
  </header>
}

// Static overview rows are temporary until the dashboard query is connected in a later phase.
const products = [
  { name: 'Minimalist Ceramic Vase', sku: 'HOM-2048', category: 'Home & Living', price: '$48.00', stock: 124, status: 'In stock', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=96&q=80', color: '#eee6df' },
  { name: 'Everyday Canvas Tote', sku: 'ACC-1032', category: 'Accessories', price: '$32.00', stock: 86, status: 'In stock', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=96&q=80', color: '#e9e7e1' },
  { name: 'Linen Throw Blanket', sku: 'HOM-1089', category: 'Home & Living', price: '$89.00', stock: 8, status: 'Low stock', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=96&q=80', color: '#e7e3db' },
  { name: 'Sculpted Brass Candle Holder', sku: 'DEC-3051', category: 'Decor', price: '$56.00', stock: 0, status: 'Out of stock', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=96&q=80', color: '#eee4d7' },
]

// Dashboard composition keeps summary, chart, category, and product sections readable separately.
function Dashboard() {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}</div><h1>Good morning, Demo member <span>✳</span></h1><p>Here’s what’s happening with your store today.</p></div><button className="primary-button"><Plus size={17} /> Add product</button></div>
    <div className="stats-grid">
      <StatCard label="Total products" value="248" change="12.8%" note="vs. last month" icon={ShoppingBag} positive />
      <StatCard label="Total categories" value="12" change="2 new" note="this month" icon={Tag} positive />
      <StatCard label="Average product price" value="$64.80" change="4.3%" note="vs. last month" icon={CreditCard} positive={false} />
      <StatCard label="Products displayed" value="248" change="All products" note="across your store" icon={Users} />
    </div>
    <div className="dashboard-grid">
      <section className="panel revenue-panel"><div className="panel-heading"><div><h2>Store overview</h2><p>Your product performance at a glance</p></div><button className="select-button">Last 7 days <ChevronDown size={14} /></button></div>
        <div className="revenue-summary"><strong>$12,486.00</strong><span className="change-pill"><ArrowUpRight size={14} /> 8.2%</span><small>compared to $11,540 last week</small></div>
        <div className="chart-wrap"><div className="chart-y"><span>$4k</span><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div><div className="chart-area"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><svg className="line-chart" viewBox="0 0 680 178" preserveAspectRatio="none" role="img" aria-label="Revenue trend has generally increased during the past week"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#61876e" stopOpacity=".18"/><stop offset="100%" stopColor="#61876e" stopOpacity="0"/></linearGradient></defs><path d="M0 139 C28 125 42 132 65 115 S106 118 132 105 S165 110 196 83 S243 95 266 77 S306 86 333 69 S376 80 400 57 S441 75 464 51 S510 61 533 41 S578 62 600 34 S650 43 680 18 L680 178 L0 178 Z" fill="url(#fill)"/><path d="M0 139 C28 125 42 132 65 115 S106 118 132 105 S165 110 196 83 S243 95 266 77 S306 86 333 69 S376 80 400 57 S441 75 464 51 S510 61 533 41 S578 62 600 34 S650 43 680 18" fill="none" stroke="#668a70" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/></svg><div className="chart-x"><span>Oct 09</span><span>Oct 10</span><span>Oct 11</span><span>Oct 12</span><span>Oct 13</span><span>Oct 14</span><span>Oct 15</span></div></div></div>
      </section>
      <section className="panel category-panel"><div className="panel-heading"><div><h2>Products by category</h2><p>Inventory breakdown</p></div><button className="icon-button" aria-label="Category options"><MoreHorizontal size={19} /></button></div><div className="donut-wrap"><div className="donut"><div><strong>248</strong><span>products</span></div></div><div className="category-legend"><Legend color="#6d8d76" label="Home & Living" value="36%"/><Legend color="#a3b7a6" label="Accessories" value="28%"/><Legend color="#d5dfd6" label="Decor" value="22%"/><Legend color="#e8eee9" label="Other" value="14%"/></div></div></section>
    </div>
    <section className="panel products-panel"><div className="panel-heading"><div><h2>Recently added</h2><p>The latest additions to your catalog</p></div><button className="text-button">View all products <ArrowUpRight size={14} /></button></div><div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th /></tr></thead><tbody>{products.map(product => <tr key={product.sku}><td><div className="product-name-cell"><div className="product-thumb" style={{ backgroundColor: product.color }}><img src={product.image} alt="" onError={event => { event.currentTarget.style.display = 'none' }} /></div><div><strong>{product.name}</strong><span>{product.sku}</span></div></div></td><td>{product.category}</td><td className="price-cell">{product.price}</td><td>{product.stock}</td><td><span className={`status status-${product.status.toLowerCase().replaceAll(' ', '-')}`}><i />{product.status}</span></td><td><button className="icon-button row-more" aria-label={`Actions for ${product.name}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing <strong>4</strong> of <strong>248</strong> products</span><button className="text-button">See all products <ArrowUpRight size={14}/></button></div></section>
  </div>
}

// A single summary card component ensures metric cards share layout and status styling.
function StatCard({ label, value, change, note, icon: Icon, positive }: { label: string; value: string; change: string; note: string; icon: typeof Package; positive?: boolean }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17} strokeWidth={1.8}/></div></div><div className="stat-bottom"><strong>{value}</strong><div className="stat-note">{positive === true && <span className="positive"><ArrowUpRight size={13}/>{change}</span>}{positive === false && <span className="negative"><ArrowDownRight size={13}/>{change}</span>}{positive === undefined && <span className="neutral-pill">{change}</span>}<span>{note}</span></div></div></article>
}
// Shared legend rows keep chart labels aligned with their category color and share.
function Legend({ color, label, value }: { color: string; label: string; value: string }) { return <div className="legend-row"><i style={{ backgroundColor: color }}/><span>{label}</span><strong>{value}</strong></div> }

// Explicit placeholders make every planned route navigable before its feature phase begins.
function Placeholder({ title }: { title: string }) { return <div className="page-content"><div className="page-heading"><div><div className="eyebrow">WORKSPACE</div><h1>{title}</h1><p>Manage your {title.toLowerCase()} in one place.</p></div></div><div className="panel placeholder-panel"><div className="placeholder-icon"><SlidersHorizontal size={22}/></div><h2>{title} workspace</h2><p>This section will be ready as we build out the next dashboard phases.</p></div></div> }

// The app shell centralizes navigation state, breadcrumbs, routes, and shared footer elements.
function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = location.pathname === '/' ? 'Overview' : location.pathname.slice(1).replace(/^./, char => char.toUpperCase())
  return <div className="app-shell"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/><main className="main-area"><Topbar title={title} onMenu={() => setMobileOpen(true)}/><Routes><Route path="/" element={<Dashboard/>}/><Route path="/products" element={<ProductsPage/>}/><Route path="/products/:productId" element={<ProductDetailsPage/>}/><Route path="/users" element={<PermissionGate permission="viewUsers"><UsersPage/></PermissionGate>}/><Route path="/categories" element={<Placeholder title="Categories"/>}/><Route path="/settings" element={<Placeholder title="Settings"/>}/><Route path="*" element={<Placeholder title="Page not found"/>}/></Routes><footer className="app-footer"><span>© 2026 Stockroom Studio</span><span><a href="#">Privacy</a><a href="#">Help center</a><span className="footer-status"><i/> All systems operational</span></span></footer></main></div>
}

// BrowserRouter enables direct navigation to each dashboard section.
export default function App() { return <BrowserRouter><AppShell/></BrowserRouter> }
