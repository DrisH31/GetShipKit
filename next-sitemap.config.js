/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Set NEXT_PUBLIC_SITE_URL to your real origin before building for production.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: ['/dashboard/**', '/api/**', '/portal', '/sign-in', '/sign-up'],
};
