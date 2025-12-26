import { getServerSideSitemap } from 'next-sitemap';
import { NextRequest } from 'next/server';

type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export async function GET(request: NextRequest) {
  // You'll need to fetch your dynamic routes from your API
  // For now, we'll create a basic structure

  // Example: Fetch products and categories from your API
interface Product {
    id: string;
    updatedAt?: string;
}

interface Category {
    id: string;
    updatedAt?: string;
}

const products: Product[] = [
    // This should be fetched from your backend API
];

  const categories: Category[] = [
    // This should be fetched from your backend API
    // Example: { id: 'category1', updatedAt: '2024-01-01' }
  ];

  const fields: Array<{
    loc: string;
    lastmod: string;
    changefreq: Changefreq;
    priority: number;
  }> = [
    // Static pages
    {
      loc: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily' as Changefreq,
      priority: 1.0,
    },
    {
      loc: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/products`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily' as Changefreq,
      priority: 0.9,
    },
    {
      loc: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/categories`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly' as Changefreq,
      priority: 0.8,
    },
    // Add dynamic product pages
    ...products.map((product) => ({
      loc: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/products/${product.id}`,
      lastmod: product.updatedAt || new Date().toISOString(),
      changefreq: 'weekly' as Changefreq,
      priority: 0.7,
    })),
    // Add dynamic category pages
    ...categories.map((category) => ({
      loc: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/categories/${category.id}`,
      lastmod: category.updatedAt || new Date().toISOString(),
      changefreq: 'weekly' as Changefreq,
      priority: 0.6,
    })),
  ];

  return getServerSideSitemap(fields);
}