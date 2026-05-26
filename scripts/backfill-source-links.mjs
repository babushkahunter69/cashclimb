import { createClient } from '@supabase/supabase-js'

const SOURCE_FALLBACKS = [
  [/irs[^<\n]*(required minimum distributions?|rmds?|retirement plan rules|withdrawals?)/i, 'https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs'],
  [/irs[^<\n]*(retirement|ira|401\(k\)|withdrawal|contribution)/i, 'https://www.irs.gov/retirement-plans'],
  [/gov\.uk[^<\n]*(pension income|pension|tax and how to take it)/i, 'https://www.gov.uk/tax-on-pension'],
  [/gov\.uk[^<\n]*(tax|hmrc)/i, 'https://www.gov.uk/browse/tax'],
  [/consumer financial protection bureau[^<\n]*(budget|secured credit|credit cards?|mortgage|consumer)/i, 'https://www.consumerfinance.gov/'],
  [/cfpb[^<\n]*(credit reports?|credit scores?)/i, 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/'],
  [/cfpb[^<\n]*(closing|mortgage)/i, 'https://www.consumerfinance.gov/owning-a-home/mortgage-closing/'],
  [/fca[^<\n]*(consumer|credit|mortgage|pension|investment)/i, 'https://www.fca.org.uk/consumers'],
  [/financial conduct authority[^<\n]*(credit cards?|consumer)/i, 'https://www.fca.org.uk/consumers/credit-cards'],
  [/moneyhelper[^<\n]*(regular investing|investing|beginner)/i, 'https://www.moneyhelper.org.uk/en/savings/investing/investing-beginners-guide'],
]

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function lookupUrl(label) {
  for (const [pattern, url] of SOURCE_FALLBACKS) {
    if (pattern.test(label)) return url
  }
  return ''
}

function relinkPlainSourceText(html) {
  const sourceNamePattern = '(?:CFPB|Consumer Financial Protection Bureau|FCA|Financial Conduct Authority|IRS|GOV\\.UK|GOV UK|MoneyHelper|Investor\\.gov|SEC)'
  let output = String(html || '')

  output = output.replace(
    new RegExp(`(<li[^>]*>\\s*)([^<]*?${sourceNamePattern}[^<]*?)(\\s*<\\/li>)`, 'gi'),
    (match, before, label, after) => {
      if (/<a\b/i.test(match)) return match
      const url = lookupUrl(stripTags(label))
      return url ? `${before}<a href="${url}" target="_blank" rel="noopener noreferrer">${stripTags(label)}</a>${after}` : match
    }
  )

  output = output.replace(
    new RegExp(`(<p[^>]*>\\s*)([^<]*?${sourceNamePattern}[^<]*?)(\\s*<\\/p>)`, 'gi'),
    (match, before, label, after) => {
      if (/<a\b/i.test(match)) return match
      const url = lookupUrl(stripTags(label))
      return url ? `${before}<a href="${url}" target="_blank" rel="noopener noreferrer">${stripTags(label)}</a>${after}` : match
    }
  )

  return output
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const { data, error } = await supabase
  .from('posts')
  .select('id, slug, title, body')
  .ilike('body', '%<h2>Sources</h2>%')

if (error) throw error

let updated = 0
const manual = []

for (const post of data || []) {
  const current = post.body || ''
  const next = relinkPlainSourceText(current)

  const sources = next.match(/<h2[^>]*>\s*Sources\s*<\/h2>([\s\S]*?)(?=<h2\b|$)/i)?.[1] || ''
  const unlinkedKnown = sources
    .split(/<\/p>|<\/li>|\n/i)
    .map(stripTags)
    .filter(Boolean)
    .filter((line) => lookupUrl(line) && !sources.includes(`>${line}</a>`))

  if (unlinkedKnown.length) {
    manual.push({ slug: post.slug, source: unlinkedKnown[0] })
    continue
  }

  if (next !== current) {
    const { error: updateError } = await supabase.from('posts').update({ body: next }).eq('id', post.id)
    if (updateError) throw updateError
    updated++
    console.log(`Updated ${post.slug}`)
  }
}

console.log(`Updated posts: ${updated}`)
if (manual.length) {
  console.log('Manual review needed:')
  for (const item of manual) console.log(`- ${item.slug}: ${item.source}`)
}
