import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProduct, getCategories, getProduct, getProducts, searchProducts, updateProduct } from '../services/productService'
import type { ProductInput } from '../types/product'
import { useAuthorization } from '../../auth/useAuthorization'

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

/** Mutations update session synchronization first, then refresh all catalog/detail observers. */
export function useProductMutations() {
  const client = useQueryClient()
  const { appRole } = useAuthorization()
  const requireAdmin = () => { if (appRole !== 'ADMIN') throw new Error('Administrator access is required.') }
  const refresh = async (id?: number) => {
    if (id) await client.invalidateQueries({ queryKey: ['products', 'detail', id] })
    await client.invalidateQueries({ queryKey: ['products'] })
  }
  return {
    create: useMutation({ mutationFn: (input: ProductInput) => { requireAdmin(); return createProduct(input) }, onSuccess: product => { client.setQueryData(['products', 'detail', product.id], product); return refresh() } }),
    update: useMutation({ mutationFn: ({ id, input }: { id: number; input: Partial<ProductInput> }) => { requireAdmin(); return updateProduct(id, input) }, onSuccess: (product, variables) => { client.setQueryData(['products', 'detail', variables.id], product); return refresh(variables.id) } }),
    remove: useMutation({ mutationFn: (id: number) => { requireAdmin(); return deleteProduct(id) }, onSuccess: (_product, id) => refresh(id) }),
  }
}
