/** Product status values returned by DummyJSON and used by the dashboard UI. */
export type ProductAvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

/** Shared shape for a product returned by DummyJSON's products endpoints. */
export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags?: string[]
  brand?: string
  sku: string
  weight?: number
  dimensions?: { width: number; height: number; depth: number }
  warrantyInformation?: string
  shippingInformation?: string
  availabilityStatus: ProductAvailabilityStatus
  reviews?: ProductReview[]
  returnPolicy?: string
  minimumOrderQuantity?: number
  meta?: ProductMeta
  thumbnail: string
  images: string[]
  /** DummyJSON adds these fields to a delete response instead of removing it. */
  isDeleted?: boolean
  deletedOn?: string
}

/** Customer review details included on product detail responses. */
export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

/** Provenance fields included in DummyJSON product responses. */
export interface ProductMeta {
  createdAt: string
  updatedAt: string
  barcode: string
  qrCode: string
}

/** Request body accepted by DummyJSON for both product creation and updates. */
export type ProductInput = Partial<Omit<Product, 'id' | 'isDeleted' | 'deletedOn'>> &
  Pick<Product, 'title' | 'description' | 'category' | 'price' | 'thumbnail'>

/** Paginated response shared by list, search, and category requests. */
export interface ProductListResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

/** Category metadata returned by the current DummyJSON categories endpoint. */
export interface ProductCategory {
  slug: string
  name: string
  url: string
}

/** Parameters for the paginated products listing endpoint. */
export interface ProductListParams {
  limit?: number
  skip?: number
  select?: string
}
