export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  priceCents: number;
  currency: string;
  image: string;
  brand: string;
  sku: string;
  addedAt: string;
}

export interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}