const INTERNAL_HOSTS = new Set(['cashclimb.org', 'www.cashclimb.org'])

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function normalizeHref(href: string) {
  const raw = String(href || '').trim()

  if (!raw) return ''
  if (raw.startsWith('#')) return raw
  if (raw.startsWith('/')) return raw
  if (/^(mailto|tel|sms):/i.test(raw)) return raw

  const cleaned = raw.replace(/&amp;/g, '&')

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const url = new URL(cleaned)
      if (INTERNAL_HOSTS.has(url.hostname.toLowerCase())) {
        return `${url.pathname}${url.search}${url.hash}` || '/'
      }
      url.protocol = 'https:'
      return url.toString()
    } catch {
      return cleaned
    }
  }

  const withoutProtocol = cleaned.replace(/^\/\//, '')
  const firstPart = withoutProtocol.split('/')[0]?.toLowerCase() || ''

  if (INTERNAL_HOSTS.has(firstPart)) {
    const path = withoutProtocol.slice(firstPart.length)
    return path.startsWith('/') ? path : `/${path}`
  }

  return `https://${withoutProtocol}`
}

export function normalizeLinksInHtml(html: string) {
  return String(html || '').replace(
    /href=(['"])(.*?)\1/gi,
    (_match, quote, href) => `href=${quote}${normalizeHref(safeDecode(href))}${quote}`
  )
}
