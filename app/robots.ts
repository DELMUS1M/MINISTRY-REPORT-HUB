import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ministry-report-hub.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: ['/dashboard', '/secretary']
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
