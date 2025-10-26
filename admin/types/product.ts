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
  images: ProductImage[];
  stock: number;
  brand: string;
  rating?: number;
  reviewCount?: number;
  specifications: ProductSpecification[];
  isActive: boolean;
  averageRating?: number;
  soldCount: number;
  dealExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

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
  imageUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}