const INTERNAL_HOSTS = new Set(['cashclimb.org', 'www.cashclimb.org'])

type CleanupOptions = {
  validateExternal?: boolean
  removeInvalid?: boolean
  rehydratePlainSources?: boolean
}

type LinkStatus = 'valid' | 'dead' | 'unknown'

type SourceFallback = {
  name: string
  url: string
  matchText: RegExp
  matchUrl?: RegExp
}

const KNOWN_URL_REPLACEMENTS: Record<string, string> = {
  'https://www.consumerfinance.gov/consumer-tools/bankruptcy/':
    'https://www.consumerfinance.gov/ask-cfpb/how-long-does-a-bankruptcy-appear-on-credit-reports-en-325/',
  'https://consumerfinance.gov/consumer-tools/bankruptcy/':
    'https://www.consumerfinance.gov/ask-cfpb/how-long-does-a-bankruptcy-appear-on-credit-reports-en-325/',
  'https://www.fca.org.uk/consumers/credit-scores-checking-and-improving-credit-report':
    'https://www.fca.org.uk/consumers',
  'https://fca.org.uk/consumers/credit-scores-checking-and-improving-credit-report':
    'https://www.fca.org.uk/consumers',
  'https://www.moneyhelper.org.uk/en/investing/regular-investing':
    'https://www.moneyhelper.org.uk/en/savings/investing/investing-beginners-guide',
  'https://moneyhelper.org.uk/en/investing/regular-investing':
    'https://www.moneyhelper.org.uk/en/savings/investing/investing-beginners-guide',
}

const SOURCE_FALLBACKS: SourceFallback[] = [
  {
    name: 'CFPB bankruptcy and credit reports',
    url: 'https://www.consumerfinance.gov/ask-cfpb/how-long-does-a-bankruptcy-appear-on-credit-reports-en-325/',
    matchText: /cfpb[^<\n]*(bankruptcy|credit report|credit score)/i,
    matchUrl: /consumerfinance\.gov\/.*bankruptcy/i,
  },
  {
    name: 'CFPB credit reports and scores',
    url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/',
    matchText: /cfpb[^<\n]*(credit reports?|credit scores?)/i,
    matchUrl: /consumerfinance\.gov\/consumer-tools\/credit-reports-and-scores/i,
  },
  {
    name: 'CFPB closing disclosure',
    url: 'https://www.consumerfinance.gov/owning-a-home/closing-disclosure/',
    matchText: /cfpb[^<\n]*(closing|closing costs?|closing disclosure|mortgage)/i,
    matchUrl: /consumerfinance\.gov\/.*(closing|mortgage)/i,
  },
  {
    name: 'CFPB mortgage closing',
    url: 'https://www.consumerfinance.gov/owning-a-home/mortgage-closing/',
    matchText: /cfpb[^<\n]*(mortgage closing|closing process)/i,
    matchUrl: /consumerfinance\.gov\/owning-a-home\/mortgage-closing/i,
  },
  {
    name: 'IRS supplemental wages',
    url: 'https://www.irs.gov/publications/p15',
    matchText: /irs[^<\n]*(bonus|bonuses|supplemental wages?)/i,
    matchUrl: /irs\.gov\/(newsroom\/bonuses-and-other-supplemental-wages|publications\/p15)/i,
  },
  {
    name: 'FCA consumers',
    url: 'https://www.fca.org.uk/consumers',
    matchText: /fca[^<\n]*(consumer|credit|mortgage|pension|investment)/i,
    matchUrl: /fca\.org\.uk\/consumers/i,
  },
  {
    name: 'FCA credit information market study',
    url: 'https://www.fca.org.uk/publications/market-studies/ms19-1-credit-information-market-study',
    matchText: /fca[^<\n]*(credit information|credit report|credit score)/i,
    matchUrl: /fca\.org\.uk\/.*credit/i,
  },
  {
    name: 'MoneyHelper investing beginners guide',
    url: 'https://www.moneyhelper.org.uk/en/savings/investing/investing-beginners-guide',
    matchText: /moneyhelper[^<\n]*(regular investing|investing|beginner)/i,
    matchUrl: /moneyhelper\.org\.uk\/.*investing/i,
  },
  {
    name: 'MoneyHelper buying a home',
    url: 'https://www.moneyhelper.org.uk/en/homes/buying-a-home',
    matchText: /moneyhelper[^<\n]*(home|house|mortgage|buying)/i,
    matchUrl: /moneyhelper\.org\.uk\/.*(homes|mortgage|buying)/i,
  },
]

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripTags(value: string) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function isExternalHttp(href: string) {
  return /^https?:\/\//i.test(href)
}

function isSkippableHref(href: string) {
  return (
    !href ||
    href.startsWith('#') ||
    href.startsWith('/') ||
    /^(mailto|tel|sms):/i.test(href)
  )
}

function findReplacementFor(url: string, anchorText = '') {
  const direct = KNOWN_URL_REPLACEMENTS[url]
  if (direct) return direct

  const byUrl = SOURCE_FALLBACKS.find((fallback) => fallback.matchUrl?.test(url))
  if (byUrl) return byUrl.url

  const text = stripTags(anchorText)
  const byText = SOURCE_FALLBACKS.find((fallback) => fallback.matchText.test(text))
  return byText?.url || ''
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

async function getExternalUrlStatus(url: string): Promise<LinkStatus> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
    })

    if (head.status >= 200 && head.status < 400) return 'valid'
    if (head.status === 401 || head.status === 403 || head.status === 405) return 'valid'
    if (head.status === 404 || head.status === 410) return 'dead'

    const get = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
    })

    if (get.status >= 200 && get.status < 400) return 'valid'
    if (get.status === 401 || get.status === 403) return 'valid'
    if (get.status === 404 || get.status === 410) return 'dead'

    return 'unknown'
  } catch {
    return 'unknown'
  }
}

function relinkPlainSourceText(html: string) {
  let output = html

  for (const fallback of SOURCE_FALLBACKS) {
    output = output.replace(
      /(<li[^>]*>\s*)([^<]*?(?:CFPB|FCA|IRS|MoneyHelper)[^<]*?)(\s*<\/li>)/gi,
      (match, before, label, after) => {
        if (/<a\b/i.test(match)) return match
        if (!fallback.matchText.test(label)) return match
        return `${before}<a href="${fallback.url}" target="_blank" rel="noopener noreferrer">${label.trim()}</a>${after}`
      }
    )
  }

  return output
}

export async function normalizeAndValidateLinksInHtml(
  html: string,
  options: CleanupOptions = {}
) {
  const opts: Required<CleanupOptions> = {
    validateExternal: options.validateExternal ?? true,
    removeInvalid: options.removeInvalid ?? true,
    rehydratePlainSources: options.rehydratePlainSources ?? true,
  }

  let output = normalizeLinksInHtml(html)

  output = output.replace(
    /<a\b([^>]*?)href=(['"])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (_match, beforeAttrs, quote, href, afterAttrs, label) => {
      const normalized = normalizeHref(safeDecode(href))
      const replacement = findReplacementFor(normalized, label)
      const finalHref = replacement || normalized
      return `<a${beforeAttrs}href=${quote}${finalHref}${quote}${afterAttrs}>${label}</a>`
    }
  )

  if (opts.validateExternal) {
    const matches = [...output.matchAll(/<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)]

    for (const match of matches) {
      const fullAnchor = match[0]
      const href = match[2]
      const label = match[3]

      if (isSkippableHref(href) || !isExternalHttp(href)) continue

      const replacement = findReplacementFor(href, label)

      if (replacement && replacement !== href) {
        output = output.replace(fullAnchor, fullAnchor.replace(href, replacement))
        continue
      }

      const status = await getExternalUrlStatus(href)

      if (status === 'dead') {
        const fallback = findReplacementFor(href, label)

        if (fallback) {
          output = output.replace(fullAnchor, fullAnchor.replace(href, fallback))
        } else if (opts.removeInvalid) {
          output = output.replace(fullAnchor, stripTags(label))
        }
      }
    }
  }

  if (opts.rehydratePlainSources) {
    output = relinkPlainSourceText(output)
  }

  return output
}

export async function cleanupExternalLinks(
  html: string,
  options: CleanupOptions = {}
) {
  return normalizeAndValidateLinksInHtml(html, options)
}
