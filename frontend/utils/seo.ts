// SEO Constants and Utilities
export const SITE_CONFIG = {
  name: 'Forbes Digital Lifeline',
  description: 'Forbes Digital Lifeline is your trusted source for all things tech. When your digital world throws you a curveball, we are your Digital SOS. We are the expert tech team ready to rescue your devices and get you back online, fast and reliably.',
  url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com',
  ogImage: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/logo/logo.png`,
  twitterHandle: '@forbesdigitals',
  email: 'info@forbesdigitals.com',
  phone: '+233 54 712 9636',
  address: {
    street: 'Your Street Address',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    postalCode: '00233',
  },
};

export const DEFAULT_SEO = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  canonical: SITE_CONFIG.url,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Logo`,
      },
    ],
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    handle: SITE_CONFIG.twitterHandle,
    site: SITE_CONFIG.twitterHandle,
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'author',
      content: SITE_CONFIG.name,
    },
    {
      name: 'publisher',
      content: SITE_CONFIG.name,
    },
    {
      name: 'robots',
      content: 'index,follow',
    },
    {
      name: 'googlebot',
      content: 'index,follow',
    },
    {
      name: 'language',
      content: 'English',
    },
    {
      name: 'geo.region',
      content: 'GH-AA', // Ghana - Greater Accra
    },
    {
      name: 'geo.country',
      content: 'Ghana',
    },
    {
      name: 'ICBM',
      content: '5.6037, -0.1870', // Approximate coordinates for Accra
    },
  ],
};

export const PRODUCT_SEO_KEYWORDS = [
  'electronics',
  'gadgets',
  'tech products',
  'laptops',
  'phones',
  'accessories',
  'computer parts',
  'gaming',
  'smart devices',
  'Forbes Digital Lifeline',
];

export const CATEGORY_SEO_KEYWORDS = [
  'product categories',
  'electronics categories',
  'tech categories',
  'device categories',
  'gadget categories',
  'Forbes Digital Lifeline',
];

// Utility function to generate product title
export function generateProductTitle(productName: string, brand?: string): string {
  if (brand && brand !== 'Generic') {
    return `${productName} by ${brand} - Forbes Digital Lifeline`;
  }
  return `${productName} - Forbes Digital Lifeline`;
}

// Utility function to generate product description
export function generateProductDescription(product: any): string {
  const baseDesc = product.description || `Buy ${product.title} at Forbes Digital Lifeline.`;
  const price = product.priceCents ? `Price: GH₵${(product.priceCents / 100).toFixed(2)}.` : '';
  const stock = product.stock > 0 ? 'In stock and ready to ship.' : 'Limited stock available.';

  return `${baseDesc} ${price} ${stock} Shop now for the best deals on tech products.`;
}

// Utility function to generate category title
export function generateCategoryTitle(categoryName: string): string {
  return `${categoryName} - Forbes Digital Lifeline`;
}

// Utility function to generate category description
export function generateCategoryDescription(categoryName: string, productCount?: number): string {
  const countText = productCount ? `Browse ${productCount} products in ` : 'Browse our collection of ';
  return `${countText}${categoryName} at Forbes Digital Lifeline. Find the best deals on tech products and accessories.`;
}

// Utility function to generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = SITE_CONFIG.url.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Utility function to generate structured data for products
export function generateProductStructuredData(product: any) {
  const price = product.priceCents ? (product.priceCents / 100).toFixed(2) : '0.00';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.map((img: any) => img.url) || [],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Forbes Digital Lifeline',
    },
    category: product.categoryId?.name,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'GHS',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: generateCanonicalUrl(`/products/${product._id}`),
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
    },
    aggregateRating: product.averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount || 0,
    } : undefined,
  };
}

// Utility function to generate structured data for organization
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.ogImage,
    description: SITE_CONFIG.description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.phone,
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.city,
      addressRegion: SITE_CONFIG.address.region,
      addressCountry: SITE_CONFIG.address.country,
      postalCode: SITE_CONFIG.address.postalCode,
    },
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.twitterHandle.replace('@', '')}`,
      'https://www.facebook.com/forbesdigitals',
      'https://www.instagram.com/forbesdigitals',
    ],
  };
}