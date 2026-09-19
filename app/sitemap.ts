import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ministry-report-hub.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 }
  ];
}
