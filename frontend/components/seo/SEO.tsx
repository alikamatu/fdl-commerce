import { Metadata } from 'next';
import { Product } from '@/types/product';
import {
  SITE_CONFIG,
  generateProductTitle,
  generateProductDescription,
  generateCategoryTitle,
  generateCategoryDescription,
  generateCanonicalUrl,
  PRODUCT_SEO_KEYWORDS,
  CATEGORY_SEO_KEYWORDS,
} from '@/utils/seo';

interface BaseSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}

interface ProductSEOProps extends BaseSEOProps {
  product: Product;
  images?: string[];
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  priceCurrency?: string;
  brand?: string;
  category?: string;
}

interface CategorySEOProps extends BaseSEOProps {
  categoryName: string;
  categoryDescription?: string;
  productCount?: number;
}

interface HomeSEOProps extends BaseSEOProps {
  featuredProducts?: Product[];
}

export function ProductSEO({
  product,
  images = [],
  availability = 'InStock',
  priceCurrency = 'GHS',
  brand,
  category,
  ...baseProps
}: ProductSEOProps): Metadata {
  const productImages = images.length > 0 ? images : [product.images?.[0]?.url].filter(Boolean);
  const price = product.priceCents ? (product.priceCents / 100).toFixed(2) : '0.00';
  const title = baseProps.title || generateProductTitle(product.title, brand);
  const description = baseProps.description || generateProductDescription(product);
  const canonical = baseProps.canonical || generateCanonicalUrl(`/products/${product._id}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      images: productImages.map(url => ({
        url: url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
        alt: product.title,
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: productImages,
    },
    keywords: baseProps.keywords || [...PRODUCT_SEO_KEYWORDS, product.title, brand].filter(Boolean) as string[],
    robots: baseProps.noindex ? 'noindex,nofollow' : 'index,follow',
    other: {
      'product:price:amount': price,
      'product:price:currency': priceCurrency,
      'product:availability': availability,
      'product:brand': brand || SITE_CONFIG.name,
      'product:category': category || '',
    },
  };
}

export function CategorySEO({
  categoryName,
  categoryDescription,
  productCount,
  ...baseProps
}: CategorySEOProps): Metadata {
  const title = baseProps.title || generateCategoryTitle(categoryName);
  const description = baseProps.description || generateCategoryDescription(categoryName, productCount);
  const canonical = baseProps.canonical || generateCanonicalUrl(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    keywords: baseProps.keywords || [...CATEGORY_SEO_KEYWORDS, categoryName],
    robots: baseProps.noindex ? 'noindex,nofollow' : 'index,follow',
  };
}

export function HomeSEO({
  featuredProducts = [],
  ...baseProps
}: HomeSEOProps): Metadata {
  const title = baseProps.title || SITE_CONFIG.name;
  const description = baseProps.description || SITE_CONFIG.description;
  const canonical = baseProps.canonical || SITE_CONFIG.url;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      images: baseProps.image ? [{ url: baseProps.image }] : [
        {
          url: SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: `${SITE_CONFIG.name} Logo`,
        },
      ],
      type: 'website',
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_CONFIG.ogImage],
    },
    keywords: baseProps.keywords || PRODUCT_SEO_KEYWORDS,
    robots: baseProps.noindex ? 'noindex,nofollow' : 'index,follow',
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
  };
}

export function GenericSEO(props: BaseSEOProps): Metadata {
  return {
    title: props.title,
    description: props.description,
    alternates: {
      canonical: props.canonical,
    },
    openGraph: {
      title: props.title,
      description: props.description,
      images: props.image ? [{ url: props.image, alt: props.title || SITE_CONFIG.name }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: props.title,
      description: props.description,
      images: props.image ? [props.image] : undefined,
    },
    keywords: props.keywords,
    robots: props.noindex ? 'noindex,nofollow' : 'index,follow',
  };
}

export { BreadcrumbSEO } from './BreadcrumbSEO';