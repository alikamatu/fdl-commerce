import { BreadcrumbJsonLd } from 'next-seo';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSEOProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSEO({ items }: BreadcrumbSEOProps) {
  const breadcrumbList = items.map((item, index) => ({
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return (
    <BreadcrumbJsonLd
      items={breadcrumbList.map(item => ({
        position: item.position,
        name: item.name,
        item: item.item,
      }))}
    />
  );
}

// Helper function to generate breadcrumbs for products
export function generateProductBreadcrumbs(product: any, category?: any): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Home',
      url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com',
    },
  ];

  if (category) {
    breadcrumbs.push({
      name: category.name,
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/categories/${category._id}`,
    });
  }

  breadcrumbs.push({
    name: product.title,
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/products/${product._id}`,
  });

  return breadcrumbs;
}

// Helper function to generate breadcrumbs for categories
export function generateCategoryBreadcrumbs(category: any): BreadcrumbItem[] {
  return [
    {
      name: 'Home',
      url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com',
    },
    {
      name: category.name,
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/categories/${category._id}`,
    },
  ];
}