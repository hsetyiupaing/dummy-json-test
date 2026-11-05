import { useQuery } from '@tanstack/react-query'
import { getCategories, getProducts, searchProducts } from '../services/productService'

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
