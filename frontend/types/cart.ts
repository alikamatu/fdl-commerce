export interface CartItem {
  id: string;
  productId: string;
  title: string;
  priceCents: number;
  currency: string;
  image: string;
  quantity: number;
  stock: number;
  brand: string;
  sku: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  taxes: number;
  itemCount: number;
}

export interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

// Payment related types
export type PaymentMethod = 'paystack' | 'cash_on_delivery' | 'cash_on_pickup';
export type DeliveryMethod = 'delivery' | 'pickup';

export interface PaymentDetails {
  method: PaymentMethod;
  reference?: string;
  status?: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}