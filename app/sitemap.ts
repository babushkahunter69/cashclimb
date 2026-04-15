import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://cashclimb.org',
      priority: 1,
      changeFrequency: 'daily',
    },
    {
      url: 'https://cashclimb.org/about',
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: 'https://cashclimb.org/blog',
      priority: 0.9,
      changeFrequency: 'daily',
    },
    {
      url: 'https://cashclimb.org/editorial-standards',
      priority: 0.7,
      changeFrequency: 'monthly',
    },
    {
      url: 'https://cashclimb.org/tools',
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    {
      url: 'https://cashclimb.org/tools/compound-calculator',
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    {
      url: 'https://cashclimb.org/tools/savings-calculator',
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    {
      url: 'https://cashclimb.org/authors/cashclimb-editorial',
      priority: 0.6,
      changeFrequency: 'monthly',
    },
    {
      url: 'https://cashclimb.org/authors/daniel-reeves',
      priority: 0.6,
      changeFrequency: 'monthly',
    },
    {
      url: 'https://cashclimb.org/authors/sophie-tran',
      priority: 0.6,
      changeFrequency: 'monthly',
    },
  ]
}