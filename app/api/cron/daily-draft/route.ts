import { NextRequest, NextResponse } from 'next/server'
import slugify from 'slugify'
import readingTime from 'reading-time'
import { createAdminClient } from '@/lib/supabase-server'
import type { Category } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type InternalLink = {
  title: string
  slug: string
  category: string | null
}

type TopicPlan = {
  primaryKeyword: string
  relatedKeywords: string[]
  searchIntent: string
  workingTitle: string
  angle: string
  audience: string
}

type ArticleOutline = {
  title: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  primaryKeyword: string
  relatedKeywords: string[]
  searchIntent: string
  keyTakeaways: string[]
  h2s: string[]
  externalSources: { label: string; url: string }[]
}

type GeneratedArticle = {
  title: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  contentHtml: string
  author: string
}

const AUTHOR_NAME = 'CashClimb Editorial'

const CATEGORY_ROTATION: Category[] = [
  'Personal Finance',
  'Credit',
  'Retirement',
  'Investing',
  'Taxes',
  'Real Estate',
]

const TOPIC_BANK: Record<Category, string[]> = {
  'Personal Finance': [
    'budgeting with irregular income',
    'how to build an emergency fund',
    'how to stop lifestyle inflation',
    'how to make a monthly budget',
    'how to split paycheck savings',
  ],
  Credit: [
    'how to use a credit card responsibly',
    'what credit utilization means',
    'how minimum payments affect debt',
    'how to rebuild credit habits',
    'buy now pay later pros and cons',
  ],
  Retirement: [
    'how to start saving for retirement',
    'retirement planning in your 20s',
    'retirement planning in your 30s',
    'how compound growth helps retirement',
    'retirement mistakes beginners make',
  ],
  Investing: [
    'beginner guide to long term investing',
    'what diversification means',
    'what risk tolerance means',
    'how to start investing carefully',
    'why chasing returns is risky',
  ],
  Taxes: [
    'basic tax concepts for freelancers',
    'how to organize records for taxes',
    'what self employed workers should track',
    'simple bookkeeping habits',
    'how to save for taxes monthly',
  ],
  'Real Estate': [
    'renting vs buying a home',
    'how to save for a down payment',
    'hidden costs of buying a house',
    'how much house can you afford',
    'first time home buyer financial checklist',
  ],
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

function getCategoryForToday(date = new Date()): Category {
  const dayNumber = Math.floor(date.getTime() / 86_400_000)
  return CATEGORY_ROTATION[dayNumber % CATEGORY_ROTATION.length]
}

function pickSeedTopic(category: Category, date = new Date()): string {
  const topics = TOPIC_BANK[category]
  const dayNumber = Math.floor(date.getTime() / 86_400_000)
  return topics[dayNumber % topics.length]
}

function buildSlug(title: string) {
  return slugify(title, { lower: true, strict: true, trim: true })
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function tryParseJson(text: string) {
  const trimmed = text.trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return valid JSON.')
  }
  return JSON.parse(trimmed.slice(start, end + 1))
}

function categorySpecificGuidance(category: Category) {
  switch (category) {
    case 'Investing':
      return [
        'Focus on long-term principles, diversification, risk, and patience.',
        'Do not mention specific stock picks, price targets, or market-timing advice.',
        'Avoid hype and guaranteed-return language.',
      ].join(' ')
    case 'Credit':
      return [
        'Focus on responsible borrowing, utilization, payment habits, and debt avoidance.',
        'Do not glamorize debt.',
      ].join(' ')
    case 'Taxes':
      return [
        'Keep the content educational and general.',
        'Do not provide personalized tax advice.',
      ].join(' ')
    case 'Real Estate':
      return [
        'Focus on affordability, budgeting, tradeoffs, and planning.',
        'Do not frame home ownership as a guaranteed wealth strategy.',
      ].join(' ')
    case 'Retirement':
      return [
        'Emphasize time horizon, consistency, employer matching, and realistic planning.',
        'Do not overpromise outcomes.',
      ].join(' ')
    case 'Personal Finance':
    default:
      return [
        'Keep the content practical, clear, and beginner-friendly.',
        'Use concrete examples and realistic tradeoffs.',
      ].join(' ')
  }
}

function pickStockCoverByCategory(category: Category): string | null {
  const map: Record<Category, string | undefined> = {
    'Personal Finance': process.env.STOCK_COVER_PERSONAL_FINANCE_URL,
    Credit: process.env.STOCK_COVER_CREDIT_URL,
    Retirement: process.env.STOCK_COVER_RETIREMENT_URL,
    Investing: process.env.STOCK_COVER_INVESTING_URL,
    Taxes: process.env.STOCK_COVER_TAXES_URL,
    'Real Estate': process.env.STOCK_COVER_REAL_ESTATE_URL,
  }

  return map[category] || null
}

async function openaiTextJson(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY.')
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a precise JSON generator for an editorial publishing workflow. Return only valid JSON with no extra commentary.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      text: {
        format: {
          type: 'text',
        },
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI request failed: ${response.status} ${text}`)
  }

  const data = await response.json()

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item: any) => item.content || [])
      ?.map((content: any) => content.text || '')
      ?.join('') ||
    ''

  if (!outputText) {
    throw new Error('OpenAI returned an empty response.')
  }

  return tryParseJson(outputText)
}

async function fetchInternalLinks(category: Category): Promise<InternalLink[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('posts')
    .select('title, slug, category')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(16)

  if (error) {
    throw new Error(`Failed to fetch internal links: ${error.message}`)
  }

  const allPosts = (data ?? []) as InternalLink[]
  const sameCategory = allPosts.filter((post) => post.category === category).slice(0, 4)
  const others = allPosts.filter((post) => post.category !== category).slice(0, 4)

  return [...sameCategory, ...others].slice(0, 6)
}

async function slugExists(slug: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('posts')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return Boolean(data)
}

async function hasSimilarRecentTitle(title: string) {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const normalized = normalizeWhitespace(title.toLowerCase())

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(40)

  if (error) throw new Error(error.message)

  return (data ?? []).some((post) => {
    const existing = normalizeWhitespace(String(post.title).toLowerCase())
    return existing === normalized
  })
}

async function hasRecentKeyword(primaryKeyword: string) {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  const needle = normalizeWhitespace(primaryKeyword.toLowerCase())

  const { data, error } = await supabase
    .from('posts')
    .select('title, excerpt, seo_title, seo_description, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)

  return (data ?? []).some((post: any) => {
    const haystack = normalizeWhitespace(
      [post.title, post.excerpt, post.seo_title, post.seo_description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    )
    return haystack.includes(needle)
  })
}

function buildTopicPlanPrompt(category: Category, seedTopic: string) {
  return `
You are planning an SEO article for CashClimb, a Western-market personal finance website.

Primary markets:
- United States
- Canada
- United Kingdom
- Australia

Return ONLY valid JSON in this exact shape:
{
  "primaryKeyword": "string",
  "relatedKeywords": ["string", "string", "string"],
  "searchIntent": "string",
  "workingTitle": "string",
  "angle": "string",
  "audience": "string"
}

Requirements:
- Category: ${category}
- Seed topic: ${seedTopic}
- Target informational or beginner-intent searches.
- Focus on keywords a real person would search.
- Western audience only.
- Use natural English for US/Canada/UK/Australia readers.
- Avoid Philippine references.
- Search intent should be concise, like "informational", "beginner guide", "comparison", "mistakes", or "checklist".
- Working title should sound editorial, not spammy.
- Angle should explain what unique value this article gives.
- Audience should be specific, like "beginners with variable income" or "new credit card users".

Category guidance:
${categorySpecificGuidance(category)}
`
}

async function generateTopicPlan(category: Category, seedTopic: string): Promise<TopicPlan> {
  const parsed = await openaiTextJson(buildTopicPlanPrompt(category, seedTopic)) as Partial<TopicPlan>

  if (
    !parsed.primaryKeyword ||
    !parsed.relatedKeywords ||
    !parsed.searchIntent ||
    !parsed.workingTitle ||
    !parsed.angle ||
    !parsed.audience
  ) {
    throw new Error('Topic plan generation returned incomplete fields.')
  }

  return {
    primaryKeyword: parsed.primaryKeyword.trim(),
    relatedKeywords: parsed.relatedKeywords.slice(0, 5).map((k) => String(k).trim()),
    searchIntent: parsed.searchIntent.trim(),
    workingTitle: parsed.workingTitle.trim(),
    angle: parsed.angle.trim(),
    audience: parsed.audience.trim(),
  }
}

function buildOutlinePrompt(
  category: Category,
  plan: TopicPlan,
  internalLinks: InternalLink[]
) {
  const linksText =
    internalLinks.length > 0
      ? internalLinks
          .map(
            (link, index) =>
              `${index + 1}. Title: "${link.title}" | URL: /blog/${link.slug} | Category: ${link.category ?? 'General'}`
          )
          .join('\n')
      : 'No internal links available.'

  return `
You are a senior SEO editor planning a finance article for CashClimb.

Primary markets:
- United States
- Canada
- United Kingdom
- Australia

Return ONLY valid JSON in this exact shape:
{
  "title": "string",
  "excerpt": "string",
  "seoTitle": "string",
  "seoDescription": "string",
  "primaryKeyword": "string",
  "relatedKeywords": ["string", "string"],
  "searchIntent": "string",
  "keyTakeaways": ["string", "string", "string"],
  "h2s": ["string", "string", "string", "string"],
  "externalSources": [
    { "label": "string", "url": "string" }
  ]
}

Article plan input:
- Category: ${category}
- Primary keyword: ${plan.primaryKeyword}
- Related keywords: ${plan.relatedKeywords.join(', ')}
- Search intent: ${plan.searchIntent}
- Working title: ${plan.workingTitle}
- Angle: ${plan.angle}
- Audience: ${plan.audience}

Requirements:
- Western-market tone only.
- Title under 70 characters.
- SEO title under 60 characters.
- Excerpt 140 to 180 characters.
- SEO description 140 to 160 characters.
- Key takeaways should be concrete and useful.
- H2s should reflect real user questions or subtopics.
- Include exactly 4 to 6 H2s.
- At least one H2 should be "Common Mistakes to Avoid" or very close.
- At least one H2 should be "What You Can Do Next" or very close.
- Choose 1 to 2 strong external sources from authoritative Western sources when relevant.
- Prefer sources like IRS, SEC, CFPB, FTC, Federal Reserve, Consumer.gov, FCA, Bank of England, or similar.
- Do not use affiliate-style or spammy sources.
- Keep the outline practical and thought-through.

Internal links available for later use:
${linksText}
`
}

async function generateOutline(
  category: Category,
  plan: TopicPlan,
  internalLinks: InternalLink[]
): Promise<ArticleOutline> {
  const parsed = await openaiTextJson(buildOutlinePrompt(category, plan, internalLinks)) as Partial<ArticleOutline>

  if (
    !parsed.title ||
    !parsed.excerpt ||
    !parsed.seoTitle ||
    !parsed.seoDescription ||
    !parsed.primaryKeyword ||
    !parsed.relatedKeywords ||
    !parsed.searchIntent ||
    !parsed.keyTakeaways ||
    !parsed.h2s
  ) {
    throw new Error('Outline generation returned incomplete fields.')
  }

  return {
    title: parsed.title.trim(),
    excerpt: parsed.excerpt.trim(),
    seoTitle: parsed.seoTitle.trim(),
    seoDescription: parsed.seoDescription.trim(),
    primaryKeyword: parsed.primaryKeyword.trim(),
    relatedKeywords: parsed.relatedKeywords.slice(0, 6).map((k) => String(k).trim()),
    searchIntent: parsed.searchIntent.trim(),
    keyTakeaways: parsed.keyTakeaways.slice(0, 5).map((k) => String(k).trim()),
    h2s: parsed.h2s.slice(0, 6).map((h) => String(h).trim()),
    externalSources: (parsed.externalSources ?? []).slice(0, 2).map((s: any) => ({
      label: String(s.label).trim(),
      url: String(s.url).trim(),
    })),
  }
}

function buildArticlePrompt(
  category: Category,
  plan: TopicPlan,
  outline: ArticleOutline,
  internalLinks: InternalLink[]
) {
  const linksText =
    internalLinks.length > 0
      ? internalLinks
          .map(
            (link, index) =>
              `${index + 1}. Title: "${link.title}" | URL: /blog/${link.slug} | Category: ${link.category ?? 'General'}`
          )
          .join('\n')
      : 'No internal links available.'

  const sourcesText =
    outline.externalSources.length > 0
      ? outline.externalSources
          .map((s, index) => `${index + 1}. ${s.label} - ${s.url}`)
          .join('\n')
      : 'No external sources selected.'

  return `
You are a senior finance editor writing for CashClimb.

Primary markets:
- United States
- Canada
- United Kingdom
- Australia

Return ONLY valid JSON in this exact shape:
{
  "title": "string",
  "excerpt": "string",
  "seoTitle": "string",
  "seoDescription": "string",
  "contentHtml": "string",
  "author": "CashClimb Editorial"
}

Article strategy:
- Category: ${category}
- Primary keyword: ${outline.primaryKeyword}
- Related keywords: ${outline.relatedKeywords.join(', ')}
- Search intent: ${outline.searchIntent}
- Audience: ${plan.audience}
- Angle: ${plan.angle}

Approved structure:
- Title: ${outline.title}
- Excerpt: ${outline.excerpt}
- SEO title: ${outline.seoTitle}
- SEO description: ${outline.seoDescription}
- H2 sections:
${outline.h2s.map((h, i) => `${i + 1}. ${h}`).join('\n')}
- Key takeaways:
${outline.keyTakeaways.map((k, i) => `${i + 1}. ${k}`).join('\n')}

Available internal links:
${linksText}

Approved external sources:
${sourcesText}

Writing requirements:
- Write for Western readers only.
- Use plain, confident, editorial English.
- Do not use markdown.
- contentHtml must be valid HTML only.
- Start with one short intro paragraph.
- Immediately after the intro, include:
  <h2>Key Takeaways</h2>
  followed by a <ul> with 3 to 5 bullet points.
- Use the approved H2 structure above.
- Each section should move the reader forward and answer a real question.
- Include at least one concrete numerical example using USD.
- Include 2 to 4 natural internal links using <a href="/blog/...">...</a>.
- Include 1 to 2 external authority links using:
  <a href="URL" target="_blank" rel="noopener noreferrer">Label</a>
- Include a "Common Mistakes to Avoid" section if not already present in the H2 list.
- Include a "What You Can Do Next" section if not already present in the H2 list.
- End with a short conclusion.
- Keep the article around 1000 to 1500 words.
- Avoid fluff, repetition, generic filler, and robotic transitions.
- Do not mention AI.
- Do not make guarantees, predictions, or personalized financial advice.
- Do not use Philippine references, agencies, institutions, or slang.
- Prefer examples and framing relevant to the US, Canada, UK, and Australia.

Thinking quality requirements:
- Before writing, internally plan the reader’s decision problem.
- Explain tradeoffs, not just tips.
- Use specific, practical explanations.
- Write like a strong editor, not a generic content generator.

Return the same title, excerpt, seoTitle, and seoDescription from the approved outline unless a tiny improvement is necessary.
Set author to "${AUTHOR_NAME}".
`
}

async function generateArticle(
  category: Category,
  plan: TopicPlan,
  outline: ArticleOutline,
  internalLinks: InternalLink[]
): Promise<GeneratedArticle> {
  const parsed = await openaiTextJson(
    buildArticlePrompt(category, plan, outline, internalLinks)
  ) as Partial<GeneratedArticle>

  if (
    !parsed.title ||
    !parsed.excerpt ||
    !parsed.seoTitle ||
    !parsed.seoDescription ||
    !parsed.contentHtml
  ) {
    throw new Error('Article generation returned incomplete fields.')
  }

  return {
    title: parsed.title.trim(),
    excerpt: parsed.excerpt.trim(),
    seoTitle: parsed.seoTitle.trim(),
    seoDescription: parsed.seoDescription.trim(),
    contentHtml: parsed.contentHtml.trim(),
    author: parsed.author?.trim() || AUTHOR_NAME,
  }
}

async function createDraftPost(
  article: GeneratedArticle,
  category: Category,
  coverUrl: string | null
) {
  const supabase = createAdminClient()
  const slug = buildSlug(article.title)
  const readTime = readingTime(stripHtml(article.contentHtml)).text

  const payload: Record<string, any> = {
    title: article.title,
    slug,
    excerpt: article.excerpt,
    body: article.contentHtml,
    category,
    author: article.author,
    cover_url: coverUrl,
    seo_title: article.seoTitle,
    seo_description: article.seoDescription,
    published: false,
    read_time: readTime,
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = process.env.CRON_SECRET

  if (!expected) {
    return jsonError('Missing CRON_SECRET environment variable.')
  }

  if (authHeader !== `Bearer ${expected}`) {
    return jsonError('Unauthorized', 401)
  }

  try {
    const now = new Date()
    const category = getCategoryForToday(now)
    const seedTopic = pickSeedTopic(category, now)
    const internalLinks = await fetchInternalLinks(category)

    const plan = await generateTopicPlan(category, seedTopic)

    if (await hasRecentKeyword(plan.primaryKeyword)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Primary keyword used recently',
        primaryKeyword: plan.primaryKeyword,
      })
    }

    const outline = await generateOutline(category, plan, internalLinks)
    const article = await generateArticle(category, plan, outline, internalLinks)
    const slug = buildSlug(article.title)

    if (await slugExists(slug)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Duplicate slug',
        slug,
        title: article.title,
      })
    }

    if (await hasSimilarRecentTitle(article.title)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Similar title already exists in recent posts',
        slug,
        title: article.title,
      })
    }

    const coverUrl = pickStockCoverByCategory(category)

    const created = await createDraftPost(article, category, coverUrl)

    return NextResponse.json({
      success: true,
      created: true,
      post: {
        id: created.id,
        title: created.title,
        slug: created.slug,
        category: created.category,
        published: created.published,
        cover_url: created.cover_url,
      },
      seo: {
        primaryKeyword: outline.primaryKeyword,
        relatedKeywords: outline.relatedKeywords,
        searchIntent: outline.searchIntent,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error creating SEO draft'

    return jsonError(message, 500)
  }
}