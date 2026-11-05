import { useQuery } from '@tanstack/react-query'
import { getCategories, getProduct, getProducts, searchProducts } from '../services/productService'

/** Cache the product catalogue by search term and request the full result for local filters. */
export function useProducts(searchTerm: string) {
  return useQuery({
    queryKey: ['products', 'list', searchTerm],
    queryFn: () => searchTerm
      ? searchProducts(searchTerm, { limit: 0 })
      : getProducts({ limit: 0 }),
  })
}

/** Keep category options independently cached from the product result. */
export function useProductCategories() {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  })
}

/** Load one product independently so deep links work without visiting the catalogue first. */
export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => getProduct(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}
