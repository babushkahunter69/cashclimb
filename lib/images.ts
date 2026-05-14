const CATEGORY_IMAGES: Record<string, string> = {
  Investing: '/images/blog/investing.svg',
  'Personal Finance': '/images/blog/personal-finance.svg',
  Credit: '/images/blog/credit.svg',
  Taxes: '/images/blog/taxes.svg',
  'Real Estate': '/images/blog/real-estate.svg',
  Retirement: '/images/blog/retirement.svg',
}

export function categoryImage(category?: string | null) {
  return CATEGORY_IMAGES[String(category || '')] || '/images/blog/personal-finance.svg'
}

export function localizeCoverUrl(url?: string | null, category?: string | null) {
  if (!url) return categoryImage(category)
  if (/^https?:\/\/(?:images\.)?pexels\.com\//i.test(url)) return categoryImage(category)
  return url
}
