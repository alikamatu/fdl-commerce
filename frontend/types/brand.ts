export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  productCount?: number;
  isActive: boolean;
}