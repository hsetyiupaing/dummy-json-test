import { api } from '../../../lib/api'
import type {
  Product,
  ProductCategory,
  ProductInput,
  ProductListParams,
  ProductListResponse,
} from '../types/product'

/** Fetch a page of products; DummyJSON applies pagination on the server. */
export async function getProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>('/products', { params })
  return response.data
}

/** Fetch the complete record used to populate a product detail or edit screen. */
export async function getProduct(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

/** Search product names through DummyJSON's dedicated search endpoint. */
export async function searchProducts(query: string, params: ProductListParams = {}): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>('/products/search', {
    params: { ...params, q: query },
  })
  return response.data
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
  return response.data
}

/** Create a product; callers should mirror the response into session cache. */
export async function createProduct(product: ProductInput): Promise<Product> {
  const response = await api.post<Product>('/products/add', product)
  return response.data
}

/** Patch editable fields; DummyJSON returns a simulated updated product. */
export async function updateProduct(id: number, product: Partial<ProductInput>): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}`, product)
  return response.data
}

/** Request a simulated deletion; DummyJSON returns the deleted record as a tombstone. */
export async function deleteProduct(id: number): Promise<Product> {
  const response = await api.delete<Product>(`/products/${id}`)
  return response.data
}
