export interface Product {
  _id: string;
  sku: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  categoryId: string;
  images: ProductImage[];
  stock: number;
  brand: string;
  specifications: ProductSpecification[];
  createdAt?: Date;
  updatedAt?: Date;
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}