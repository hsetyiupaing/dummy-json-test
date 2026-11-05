import { api } from '../../../lib/api'
import type {
  Product,
  ProductCategory,
  ProductInput,
  ProductListParams,
  ProductListResponse,
} from '../types/product'

const sessionKey = 'stockroom.productMutations.v1'
type ProductSession = { created: Product[]; updated: Record<number, Partial<Product>>; deleted: number[] }
function readSession(): ProductSession {
  try { return JSON.parse(sessionStorage.getItem(sessionKey) || '{"created":[],"updated":{},"deleted":[]}') as ProductSession }
  catch { return { created: [], updated: {}, deleted: [] } }
}
function saveSession(value: ProductSession) { sessionStorage.setItem(sessionKey, JSON.stringify(value)) }
export function synchronizeProduct(product: Product): Product {
  const state = readSession()
  return { ...product, ...state.updated[product.id] }
}
function synchronizeList(response: ProductListResponse, matches: (product: Product) => boolean = () => true): ProductListResponse {
  const state = readSession()
  const deleted = new Set(state.deleted)
  const merged = new Map<number, Product>()
  for (const product of response.products) if (!deleted.has(product.id)) { const synchronized = synchronizeProduct(product); if (matches(synchronized)) merged.set(product.id, synchronized) }
  for (const product of state.created) if (!deleted.has(product.id)) { const synchronized = synchronizeProduct(product); if (matches(synchronized)) merged.set(product.id, synchronized) }
  const createdCount = state.created.filter(product => !deleted.has(product.id) && matches(synchronizeProduct(product))).length
  const deletedCount = state.deleted.filter(id => response.products.some(product => product.id === id)).length
  return { ...response, products: [...merged.values()], total: Math.max(0, response.total + createdCount - deletedCount) }
}

/** Fetch a page of products; DummyJSON applies pagination on the server. */
export async function getProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>('/products', { params })
  return synchronizeList(response.data)
}

/** Fetch the complete record used to populate a product detail or edit screen. */
export async function getProduct(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`)
  const state = readSession(); if (state.deleted.includes(id)) throw new Error('This product was deleted in this session.')
  return synchronizeProduct(response.data)
}

/** Search product names through DummyJSON's dedicated search endpoint. */
export async function searchProducts(query: string, params: ProductListParams = {}): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>('/products/search', {
    params: { ...params, q: query },
  })
  return synchronizeList(response.data, product => product.title.toLowerCase().includes(query.toLowerCase()))
}

/** Read category metadata for the category selector and management page. */
export async function getCategories(): Promise<ProductCategory[]> {
  const response = await api.get<ProductCategory[]>('/products/categories')
  return response.data
}

/** Fetch one category's products while preserving DummyJSON pagination support. */
export async function getProductsByCategory(
  category: string,
  params: ProductListParams = {},
): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>(
    `/products/category/${encodeURIComponent(category)}`,
    { params },
  )
  return synchronizeList(response.data, product => product.category === category)
}

/** Create a product; callers should mirror the response into session cache. */
export async function createProduct(product: ProductInput): Promise<Product> {
  const response = await api.post<Product>('/products/add', product)
  const created = response.data
  const state = readSession(); state.created = [created, ...state.created.filter(item => item.id !== created.id)]; delete state.updated[created.id]; state.deleted = state.deleted.filter(id => id !== created.id); saveSession(state)
  return created
}

/** Patch editable fields; DummyJSON returns a simulated updated product. */
export async function updateProduct(id: number, product: Partial<ProductInput>): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, product)
  const updated = { ...synchronizeProduct(response.data), ...product }
  const state = readSession(); state.updated[id] = { ...state.updated[id], ...product }; state.created = state.created.map(item => item.id === id ? updated : item); saveSession(state)
  return updated
}

/** Request a simulated deletion; DummyJSON returns the deleted record as a tombstone. */
export async function deleteProduct(id: number): Promise<Product> {
  const response = await api.delete<Product>(`/products/${id}`)
  const state = readSession(); state.deleted = [...new Set([...state.deleted, id])]; state.created = state.created.filter(item => item.id !== id); delete state.updated[id]; saveSession(state)
  return response.data
}
