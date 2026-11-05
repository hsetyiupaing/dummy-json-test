import type { Product } from '../products/types/product'

/** A cart line stores the DummyJSON product fields needed by storefront and checkout. */
export interface CartLine {
  product: Pick<Product, 'id' | 'title' | 'price' | 'discountPercentage' | 'thumbnail' | 'category'>
  quantity: number
}

/** One locally persisted demo order records the exact cart and delivery summary at placement. */
export interface DemoOrder {
  id: string
  createdAt: string
  status: 'Processing'
  items: CartLine[]
  subtotal: number
  shipping: number
  total: number
  customerName: string
  email: string
  address: string
  city: string
  postalCode: string
}

/** DummyJSON's carts-by-user result contains sample cart contents for a real API user ID. */
export interface DummyCartResponse {
  carts: Array<{
    id: number
    userId: number
    products: Array<{
      id: number
      title: string
      price: number
      quantity: number
      discountPercentage: number
      thumbnail: string
    }>
  }>
}
