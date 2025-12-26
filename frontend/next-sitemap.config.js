/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin/**', '/api/**', '/_next/**', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/cart/', '/wishlist/'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://forbesdigitals.com'}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different page types
    const pathPriority = {
      '/': 1.0,
      '/products': 0.9,
      '/categories': 0.8,
    };

    const pathChangefreq = {
      '/': 'daily',
      '/products': 'daily',
      '/categories': 'weekly',
    };

    return {
      loc: path,
      changefreq: pathChangefreq[path] || config.changefreq,
      priority: pathPriority[path] || config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  additionalPaths: async (config) => {
    const result = [];

    // Add additional static paths if needed
    // This could be expanded to fetch dynamic paths from your API

    return result;
  },
};
