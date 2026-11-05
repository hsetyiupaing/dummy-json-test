import { useState, type FormEvent } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Box, ChevronDown, LogOut, Search, ShoppingBag, UserRound } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { useCart } from '../CartContext'
import './storefront.css'

/** Give every customer route a real storefront navigation, account menu, and shared footer. */
export default function StorefrontLayout() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // Search submits through the catalog URL so direct navigation retains the customer's query.
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/shop/products${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`)
  }

  return <div className="storefront-shell">
    <div className="storefront-announcement">Stockroom Studio — thoughtful finds for everyday living</div>
    <header className="storefront-header">
      <Link className="storefront-brand" to="/shop" aria-label="Stockroom Studio home"><span><Box size={19}/></span><strong>Stockroom <em>Studio</em></strong></Link>
      <nav className="storefront-nav" aria-label="Store navigation"><Link to="/shop">Home</Link><Link to="/shop/products">Shop all</Link><Link to="/shop/products?sort=rating">Popular</Link></nav>
      <form className="storefront-search" onSubmit={submitSearch} role="search"><Search size={16}/><input aria-label="Search products" placeholder="Search products" value={search} onChange={event => setSearch(event.target.value)}/></form>
      <div className="storefront-actions">
        <Link className="cart-link" to="/cart" aria-label={`Shopping cart, ${itemCount} items`}><ShoppingBag size={20}/><span>Cart</span><b>{itemCount}</b></Link>
        <details className="account-menu"><summary><img src={user?.image} alt=""/><span>{user?.firstName}</span><ChevronDown size={14}/></summary><div className="account-menu-popover"><strong>{user?.firstName} {user?.lastName}</strong><small>{user?.email}</small><Link to="/account"><UserRound size={15}/> My account</Link><Link to="/account/orders"><ShoppingBag size={15}/> Orders</Link><button onClick={() => { logout(); navigate('/login', { replace: true }) }}><LogOut size={15}/> Sign out</button></div></details>
      </div>
    </header>
    <nav className="storefront-mobile-nav" aria-label="Store navigation"><Link to="/shop">Home</Link><Link to="/shop/products">Shop all</Link><Link to="/account">Account</Link></nav>
    <Outlet/>
    <footer className="storefront-footer"><div><Link className="storefront-brand" to="/shop"><span><Box size={18}/></span><strong>Stockroom <em>Studio</em></strong></Link><p>Find useful things to make home feel more like yours.</p></div><div className="storefront-footer-links"><Link to="/shop/products">Shop products</Link><Link to="/account">Your account</Link><Link to="/account/orders">Order history</Link></div><small>Demo storefront · Product information provided by DummyJSON</small></footer>
  </div>
}
