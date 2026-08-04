export interface ProductImage {
  url: string;
  alt: string;
  position: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  sku: string;
  title: string;
  isDeal: boolean;
  description: string;
  priceCents: number;
  originalPriceCents?: number;
  discountPercent?: number;
  currency: string;
  categoryId: Category;
  averageRating: number;
  images: ProductImage[];
  stock: number;
  brand: string;
  rating?: number;
  reviewCount?: number;
  specifications: ProductSpecification[];
  isActive: boolean;
  soldCount: number;
  likeCount: number;
  dealExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ProductsFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}