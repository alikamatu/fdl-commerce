export interface OrderItem {
  productId: string;
  title: string;
  priceCents: number;
  quantity: number;
  image: string;
  sku: string;
  brand: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'delivering' | 'available' | 'delivered' | 'cancelled';
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryMethod: 'delivery' | 'pickup';

}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}