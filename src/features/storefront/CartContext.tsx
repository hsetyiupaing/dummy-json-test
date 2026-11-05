import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { getUserCarts } from './services/storefrontService'
import type { CartLine } from './types'

/** Cart operations remain local because DummyJSON cart mutations are simulated only. */
interface CartContextValue {
  items: CartLine[]
  isLoading: boolean
  error: Error | null
  itemCount: number
  subtotal: number
  addItem: (product: CartLine['product'], quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/** Scope local cart storage and DummyJSON seed data to the authenticated account. */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <CartSession key={user?.id ?? 'signed-out'} userId={user?.id ?? null}>{children}</CartSession>
}

/** Keep account changes isolated by remounting this session with a separate user-specific key. */
function CartSession({ children, userId }: { children: ReactNode; userId: number | null }) {
  const storageKey = userId ? `stockroom.cart.${userId}` : 'stockroom.cart.signed-out'
  const [localItems, setLocalItems] = useState<CartLine[] | null>(() => readCart(storageKey))
  const cartQuery = useQuery({
    queryKey: ['carts', 'user', userId],
    queryFn: () => getUserCarts(userId!),
    enabled: userId !== null && localItems === null,
    staleTime: 5 * 60_000,
  })
  const sampleItems = useMemo<CartLine[]>(() => cartQuery.data?.carts[0]?.products.map(item => ({
    product: { id: item.id, title: item.title, price: item.price, discountPercentage: item.discountPercentage, thumbnail: item.thumbnail, category: '' },
    quantity: item.quantity,
  })) ?? [], [cartQuery.data])
  const items = localItems ?? sampleItems

  // Persist only after a customer changes a line, preserving API-seeded cart behavior for untouched accounts.
  useEffect(() => {
    if (localItems !== null) window.localStorage.setItem(storageKey, JSON.stringify(localItems))
  }, [localItems, storageKey])

  const addItem = useCallback((product: CartLine['product'], quantity = 1) => {
    setLocalItems(current => mergeItem(current ?? sampleItems, product, quantity))
  }, [sampleItems])
  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLocalItems(current => (current ?? sampleItems).map(item => item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
  }, [sampleItems])
  const removeItem = useCallback((productId: number) => {
    setLocalItems(current => (current ?? sampleItems).filter(item => item.product.id !== productId))
  }, [sampleItems])
  const clearCart = useCallback(() => setLocalItems([]), [])
  const value = useMemo<CartContextValue>(() => ({
    items,
    isLoading: localItems === null && cartQuery.isPending,
    error: cartQuery.error instanceof Error ? cartQuery.error : null,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    addItem,
    setQuantity,
    removeItem,
    clearCart,
  }), [items, localItems, cartQuery.isPending, cartQuery.error, addItem, setQuantity, removeItem, clearCart])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/** Merge an existing line or append a new product while preserving its requested quantity. */
function mergeItem(items: CartLine[], product: CartLine['product'], quantity: number): CartLine[] {
  const existing = items.find(item => item.product.id === product.id)
  if (existing) return items.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
  return [...items, { product, quantity }]
}

/** Read and validate a user cart so malformed browser data cannot crash shopping pages. */
function readCart(key: string): CartLine[] | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return null
    return value.filter((item): item is CartLine => Boolean(item && typeof item === 'object'
      && typeof item.product?.id === 'number' && typeof item.product?.title === 'string'
      && typeof item.product?.price === 'number' && typeof item.quantity === 'number'))
  } catch {
    return null
  }
}

/** Expose the active account's cart and mutations to storefront pages. */
// This hook shares the provider module with its context component, so Fast Refresh's file rule is intentionally disabled here.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
