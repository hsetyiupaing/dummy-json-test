import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowUpRight, ChevronDown, ChevronUp, Search, Tag } from 'lucide-react'
import { getProducts, getProductsByCategory } from '../../products/services/productService'
import { useProductCategories } from '../../products/hooks/useProducts'
import type { ProductCategory } from '../../products/types/product'

/** Manage category discovery using DummyJSON metadata without suggesting persistent CRUD support. */
export default function CategoryManagementPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const categoriesQuery = useProductCategories()
  const allProductsQuery = useQuery({ queryKey: ['products', 'category-counts'], queryFn: () => getProducts({ limit: 0 }), staleTime: 5 * 60_000 })
  const categories = useMemo(() => (categoriesQuery.data ?? []).filter(category => `${category.name} ${category.slug}`.toLowerCase().includes(search.toLowerCase().trim())), [categoriesQuery.data, search])
  const productCounts = new Map<string, number>()
  for (const product of allProductsQuery.data?.products ?? []) productCounts.set(product.category, (productCounts.get(product.category) ?? 0) + 1)

  return <main className="page-content category-management-page"><div className="page-heading"><div><div className="eyebrow">CATALOG ORGANIZATION</div><h1>Categories</h1><p>Browse the categories available in the DummyJSON product catalog.</p></div><span className="category-count-pill"><Tag size={14}/>{categoriesQuery.data?.length ?? '—'} categories</span></div><div className="category-data-note">DummyJSON provides read-only category data. Changes to the catalog cannot be saved from this demo.</div><section className="panel category-management-panel"><div className="category-management-toolbar"><label><Search size={16}/><input aria-label="Search categories" placeholder="Search categories or slugs" value={search} onChange={event => setSearch(event.target.value)}/></label><span>Category names and links come directly from the API</span></div>{categoriesQuery.isPending ? <div className="category-management-state">Loading categories…</div> : categoriesQuery.isError ? <div className="category-management-state category-error"><AlertCircle size={23}/><h2>Categories could not be loaded</h2><p>{categoriesQuery.error.message}</p><button onClick={() => void categoriesQuery.refetch()}>Try again</button></div> : categories.length === 0 ? <div className="category-management-state"><Tag size={24}/><h2>No categories found</h2><p>Try a different search term.</p></div> : <div className="category-management-list">{categories.map(category => <CategoryRow key={category.slug} category={category} selected={selected === category.slug} productCount={productCounts.get(category.slug)} onToggle={() => setSelected(value => value === category.slug ? null : category.slug)}/>)}</div>}</section></main>
}

/** Expand a category to load and show the real products from its DummyJSON category endpoint. */
function CategoryRow({ category, selected, productCount, onToggle }: { category: ProductCategory; selected: boolean; productCount?: number; onToggle: () => void }) {
  const productsQuery = useQuery({ queryKey: ['products', 'category', category.slug], queryFn: () => getProductsByCategory(category.slug, { limit: 0 }), enabled: selected })
  return <article className="category-row"><div className="category-row-main"><div className="category-row-icon"><Tag size={17}/></div><div className="category-row-title"><strong>{category.name}</strong><span>{category.slug}</span></div><span className="category-product-count">{productCount === undefined && !productsQuery.isError ? '…' : productCount ?? productsQuery.data?.total ?? 0} products</span><a className="category-api-link" href={category.url} target="_blank" rel="noreferrer" aria-label={`Open ${category.name} category API`}><ArrowUpRight size={14}/></a><button className="category-toggle" onClick={onToggle} aria-expanded={selected}>{selected ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}<span>{selected ? 'Hide products' : 'View products'}</span></button></div>{selected && <div className="category-products">{productsQuery.isPending ? <p>Loading products in {category.name}…</p> : productsQuery.isError ? <p className="category-error-text">Couldn’t load products for this category. <button onClick={() => void productsQuery.refetch()}>Retry</button></p> : productsQuery.data?.products.length ? productsQuery.data.products.map(product => <div className="category-product" key={product.id}><img src={product.thumbnail} alt=""/><span>{product.title}</span><strong>${product.price.toFixed(2)}</strong></div>) : <p>No products are currently listed in this category.</p>}</div>}</article>
}
