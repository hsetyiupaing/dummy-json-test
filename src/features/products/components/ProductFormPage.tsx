import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Image, Package, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthorization } from '../../auth/useAuthorization'
import { useProduct, useProductCategories, useProductMutations } from '../hooks/useProducts'
import type { ProductInput } from '../types/product'
import './ProductFormPage.css'

type Fields = { title: string; description: string; category: string; price: string; discountPercentage: string; brand: string; sku: string; stock: string; thumbnail: string; images: string }
const empty: Fields = { title: '', description: '', category: '', price: '', discountPercentage: '0', brand: '', sku: '', stock: '0', thumbnail: '', images: '' }
function fieldsFrom(product: NonNullable<ReturnType<typeof useProduct>['data']>): Fields {
  return { title: product.title, description: product.description, category: product.category, price: String(product.price), discountPercentage: String(product.discountPercentage), brand: product.brand ?? '', sku: product.sku ?? '', stock: String(product.stock), thumbnail: product.thumbnail, images: product.images.join('\n') }
}

export default function ProductFormPage() {
  const { productId } = useParams(); const id = Number(productId); const editing = Boolean(productId)
  const { appRole } = useAuthorization(); const navigate = useNavigate()
  const categories = useProductCategories(); const productQuery = useProduct(id); const mutations = useProductMutations()
  const [form, setForm] = useState<Fields>(empty); const [dirty, setDirty] = useState(false); const [imageError, setImageError] = useState(false)
  if (appRole !== 'ADMIN') return <div className="page-content"><h1>Access denied</h1><p>Only administrators can change products.</p></div>
  if (editing && productQuery.isPending) return <div className="page-content"><p>Loading product…</p></div>
  if (editing && (productQuery.isError || !productQuery.data)) return <div className="page-content"><h1>Product unavailable</h1><p>Could not load this product for editing.</p><Link to="/admin/products">Back to products</Link></div>
  const values = editing && productQuery.data && !dirty ? fieldsFrom(productQuery.data) : form
  const busy = mutations.create.isPending || mutations.update.isPending
  const set = (key: keyof Fields, value: string) => { setForm({ ...values, [key]: value }); setDirty(true) }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (appRole !== 'ADMIN') { toast.error('Administrator access is required.'); return }
    const input: ProductInput = { title: values.title.trim(), description: values.description.trim(), category: values.category, price: Number(values.price), discountPercentage: Number(values.discountPercentage), brand: values.brand.trim(), sku: values.sku.trim(), stock: Number(values.stock), thumbnail: values.thumbnail.trim(), images: values.images.split('\n').map(value => value.trim()).filter(Boolean) }
    try {
      if (editing) { await mutations.update.mutateAsync({ id, input }); toast.success('Product updated for this session.') }
      else { await mutations.create.mutateAsync(input); toast.success('Product added for this session.') }
      navigate('/admin/products')
    } catch { toast.error('Could not save the product. Please try again.') }
  }
  return <div className="page-content product-form-page"><Link className="back-link" to={editing ? `/admin/products/${id}` : '/admin/products'}><ArrowLeft size={15}/> Back to products</Link><div className="page-heading"><div><div className="eyebrow">PRODUCT CATALOG</div><h1>{editing ? 'Edit product' : 'Add product'}</h1><p>Changes are reflected in this browser session. DummyJSON does not persist mutations remotely.</p></div></div>
    <form className="product-edit-form" onSubmit={submit}><section className="panel"><h2>Product details</h2><div className="product-form-grid"><label>Product title<input required minLength={2} maxLength={100} value={values.title} onChange={e => set('title', e.target.value)}/></label><label>Category<select required value={values.category} onChange={e => set('category', e.target.value)}><option value="">Choose category</option>{categories.data?.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}{values.category && !categories.data?.some(item => item.slug === values.category) && <option value={values.category}>{values.category}</option>}</select></label><label className="wide-field">Description<textarea required minLength={5} rows={4} value={values.description} onChange={e => set('description', e.target.value)}/></label><label>Price<input required type="number" min="0.01" step="0.01" value={values.price} onChange={e => set('price', e.target.value)}/></label><label>Discount percentage<input type="number" min="0" max="100" step="0.1" value={values.discountPercentage} onChange={e => set('discountPercentage', e.target.value)}/></label><label>Brand<input value={values.brand} onChange={e => set('brand', e.target.value)}/></label><label>SKU<input value={values.sku} onChange={e => set('sku', e.target.value)}/></label><label>Stock quantity<input required type="number" min="0" step="1" value={values.stock} onChange={e => set('stock', e.target.value)}/></label><label>Thumbnail / image URL<input type="url" value={values.thumbnail} onChange={e => {set('thumbnail', e.target.value);setImageError(false)}} placeholder="https://…"/></label><label className="wide-field">Additional image URLs<textarea rows={3} value={values.images} onChange={e => set('images', e.target.value)} placeholder="One URL per line"/></label></div></section>
      <aside className="panel product-preview"><h2>Image preview</h2><div className="product-preview-image">{values.thumbnail && !imageError ? <img src={values.thumbnail} alt="Product preview" onError={() => setImageError(true)}/> : <><Package size={28}/><span>{imageError ? 'Image could not be loaded' : 'Add a thumbnail URL'}</span></>}</div><span><Image size={14}/> Preview uses contain sizing to show the full product.</span></aside>
      <div className="product-form-actions"><Link className="secondary-button" to="/admin/products">Cancel</Link><button className="primary-button" type="submit" disabled={busy}><Save size={15}/>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button></div>
    </form>
  </div>
}
