import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowDown, ArrowDownUp, ArrowUp, ChevronDown, ChevronLeft, ChevronRight,
  CircleAlert, ListFilter, Package, Plus, RotateCcw, Search, X,
} from 'lucide-react'
import { useProductCategories, useProductMutations, useProducts } from '../hooks/useProducts'
import { useAuthorization } from '../../auth/useAuthorization'
import type { Product, ProductAvailabilityStatus } from '../types/product'
import './ProductsPage.css'

type SortKey = 'title' | 'price' | 'rating' | 'stock'
type SortDirection = 'asc' | 'desc'

const pageSizeOptions = [10, 20, 30]

/** Normalize API stock state so filters and badges use one consistent definition. */
function getAvailability(product: Product): ProductAvailabilityStatus {
  if (product.stock <= 0) return 'Out of Stock'
  if (product.stock <= 10) return 'Low Stock'
  return 'In Stock'
}

/** Format currency consistently for the product table. */
function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

/** Render the API-backed catalogue with debounced search and local filter/sort/page controls. */
export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const productsQuery = useProducts(searchTerm)
  const categoriesQuery = useProductCategories()
  const { appRole } = useAuthorization()
  const mutations = useProductMutations()

  // Debouncing avoids sending a request for every keystroke while keeping the input responsive.
  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchTerm(searchInput.trim()), 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const filteredProducts = useMemo(() => {
    const products = productsQuery.data?.products ?? []
    return products.filter(product => {
      const matchesCategory = category === 'all' || product.category === category
      const matchesAvailability = availability === 'all' || getAvailability(product) === availability
      const matchesPrice = priceRange === 'all'
        || (priceRange === 'under-50' && product.price < 50)
        || (priceRange === '50-100' && product.price >= 50 && product.price <= 100)
        || (priceRange === 'over-100' && product.price > 100)
      return matchesCategory && matchesAvailability && matchesPrice
    })
  }, [productsQuery.data, category, availability, priceRange])

  // Sorting a copied array avoids mutating the cached API response.
  const sortedProducts = useMemo(() => [...filteredProducts].sort((left, right) => {
    const leftValue = left[sortKey]
    const rightValue = right[sortKey]
    const comparison = typeof leftValue === 'string' && typeof rightValue === 'string'
      ? leftValue.localeCompare(rightValue)
      : Number(leftValue) - Number(rightValue)
    return sortDirection === 'asc' ? comparison : -comparison
  }), [filteredProducts, sortKey, sortDirection])

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const filtersActive = category !== 'all' || availability !== 'all' || priceRange !== 'all'

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearchTerm(searchInput.trim())
    setPage(1)
  }

  function clearFilters() {
    setCategory('all')
    setAvailability('all')
    setPriceRange('all')
    setSearchInput('')
    setSearchTerm('')
    setPage(1)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDirection(direction => direction === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDirection(key === 'title' ? 'asc' : 'desc') }
  }

  async function removeProduct(product: Product) {
    if (appRole !== 'ADMIN') { toast.error('Administrator access is required.'); return }
    if (!window.confirm(`Delete “${product.title}” from this session's catalog?`)) return
    try { await mutations.remove.mutateAsync(product.id); toast.success(`${product.title} was removed from this session.`) }
    catch { toast.error(`Could not delete ${product.title}.`) }
  }

  return <div className="page-content products-page">
    <div className="page-heading">
      <div><div className="eyebrow">CATALOG</div><h1>Products</h1><p>Manage and organize your product catalog.</p></div>
      {appRole === 'ADMIN' && <Link className="primary-button" to="/admin/products/create"><Plus size={17} /> Add product</Link>}
    </div>

    <section className="catalog-panel panel" aria-label="Product catalog">
      <div className="catalog-toolbar">
        <form className="catalog-search" onSubmit={submitSearch} role="search">
          <Search size={16} aria-hidden="true" />
          <input value={searchInput} onChange={event => { setSearchInput(event.target.value); setPage(1) }} placeholder="Search products..." aria-label="Search products by name" />
          {searchInput && <button className="search-clear" type="button" aria-label="Clear search" onClick={() => { setSearchInput(''); setSearchTerm(''); setPage(1) }}><X size={14}/></button>}
          <button type="submit" className="search-submit">Search</button>
        </form>
        <div className="filter-group" aria-label="Product filters">
          <label className="filter-select"><ListFilter size={14}/><select value={category} onChange={event => { setCategory(event.target.value); setPage(1) }} aria-label="Filter by category"><option value="all">All categories</option>{categoriesQuery.data?.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select><ChevronDown size={13}/></label>
          <label className="filter-select"><select value={availability} onChange={event => { setAvailability(event.target.value); setPage(1) }} aria-label="Filter by availability"><option value="all">Any status</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></select><ChevronDown size={13}/></label>
          <label className="filter-select"><select value={priceRange} onChange={event => { setPriceRange(event.target.value); setPage(1) }} aria-label="Filter by price"><option value="all">Any price</option><option value="under-50">Under $50</option><option value="50-100">$50 – $100</option><option value="over-100">Over $100</option></select><ChevronDown size={13}/></label>
          {filtersActive && <button className="clear-filters" onClick={clearFilters}><RotateCcw size={13}/> Clear</button>}
        </div>
      </div>

      {productsQuery.isPending ? <ProductSkeleton/> : productsQuery.isError ? <div className="catalog-state error-state"><CircleAlert size={24}/><h2>Couldn’t load products</h2><p>{productsQuery.error instanceof Error ? productsQuery.error.message : 'Check your connection and try again.'}</p><button className="secondary-button" onClick={() => void productsQuery.refetch()}>Try again</button></div> : sortedProducts.length === 0 ? <div className="catalog-state"><div className="empty-icon"><Package size={23}/></div><h2>{searchTerm || filtersActive ? 'No products match your search' : 'No products yet'}</h2><p>{searchTerm || filtersActive ? 'Try a different search or clear your filters.' : 'Products from your catalog will appear here.'}</p>{(searchTerm || filtersActive) && <button className="secondary-button" onClick={clearFilters}>Clear search and filters</button>}</div> : <>
        <div className="catalog-table-scroll"><table className="catalog-table"><thead><tr>
          <th><SortButton label="PRODUCT" sortKey="title" activeKey={sortKey} direction={sortDirection} onClick={toggleSort}/></th>
          <th>CATEGORY</th><th>BRAND</th>
          <th><SortButton label="PRICE" sortKey="price" activeKey={sortKey} direction={sortDirection} onClick={toggleSort}/></th>
          <th><SortButton label="STOCK" sortKey="stock" activeKey={sortKey} direction={sortDirection} onClick={toggleSort}/></th>
          <th><SortButton label="RATING" sortKey="rating" activeKey={sortKey} direction={sortDirection} onClick={toggleSort}/></th><th>STATUS</th><th>ID</th>{appRole === 'ADMIN' && <th>ACTIONS</th>}
        </tr></thead><tbody>{visibleProducts.map(product => <ProductRow product={product} key={product.id} admin={appRole === 'ADMIN'} onDelete={() => void removeProduct(product)} deleting={mutations.remove.isPending && mutations.remove.variables === product.id}/>)}</tbody></table></div>
        <div className="catalog-footer"><div className="page-size-control"><span>Rows per page</span><label><select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1) }} aria-label="Rows per page">{pageSizeOptions.map(size => <option key={size} value={size}>{size}</option>)}</select><ChevronDown size={12}/></label></div><span className="catalog-count">Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedProducts.length)}</strong> of <strong>{sortedProducts.length}</strong> products</span><div className="pagination"><span>Page {currentPage} of {pageCount}</span><button className="icon-button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft size={16}/></button><button className="icon-button" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}><ChevronRight size={16}/></button></div></div>
      </>}
    </section>
  </div>
}

/** Use semantic buttons for sortable headers and expose the current direction accessibly. */
function SortButton({ label, sortKey, activeKey, direction, onClick }: {
  label: string; sortKey: SortKey; activeKey: SortKey; direction: SortDirection; onClick: (key: SortKey) => void
}) {
  const active = sortKey === activeKey
  return <button className={`sort-button ${active ? 'sort-active' : ''}`} onClick={() => onClick(sortKey)} aria-label={`Sort by ${label.toLowerCase()}${active ? `, ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}>
    {label}{active ? direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowDownUp size={12}/>}
  </button>
}

/** Product rows keep images resilient and show an accessible visual stock state. */
function ProductRow({ product, admin, onDelete, deleting }: { product: Product; admin: boolean; onDelete: () => void; deleting: boolean }) {
  const availability = getAvailability(product)
  const image = product.thumbnail || product.images[0]
  return <tr>
    <td><Link to={`/admin/products/${product.id}`} className="product-name-cell product-name-link"><div className="catalog-thumb"><img src={image} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/><Package size={16}/></div><div><strong>{product.title}</strong><span>{product.sku || 'SKU unavailable'}</span></div></Link></td>
    <td><span className="category-chip">{product.category.replaceAll('-', ' ')}</span></td><td>{product.brand || <span className="muted-value">—</span>}</td>
    <td className="price-cell">{formatPrice(product.price)}</td><td><span className={product.stock <= 10 ? 'stock-warning' : ''}>{product.stock}</span></td>
    <td><span className="rating-cell"><span>★</span> {product.rating.toFixed(1)}</span></td>
    <td><span className={`status status-${availability.toLowerCase().replaceAll(' ', '-')}`}><i/>{availability}</span></td>
    <td><Link className="product-id-link" to={`/admin/products/${product.id}`}>#{product.id}</Link></td>{admin && <td><div className="product-row-actions"><Link to={`/admin/products/${product.id}/edit`}>Edit</Link><button type="button" disabled={deleting} onClick={onDelete}>{deleting ? 'Deleting…' : 'Delete'}</button></div></td>}
  </tr>
}

/** Skeleton rows preserve table geometry while product requests are in flight. */
function ProductSkeleton() {
  return <div className="skeleton-table" aria-label="Loading products" aria-busy="true">{Array.from({ length: 7 }, (_, index) => <div className="skeleton-row" key={index}><i/><span/><span/><span/><span/></div>)}</div>
}
