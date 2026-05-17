import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kalvin-portfolio.com';
  
  const routes = ['', '/propos', '/projets', '/contact'];
  
  return routes.map((route) => ({
    url: `${baseUrl}/fr${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
    alternates: {
      languages: {
        fr: `${baseUrl}/fr${route}`,
        en: `${baseUrl}/en${route}`,
      },
    },
  }));
}
