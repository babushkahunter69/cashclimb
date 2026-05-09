import slugify from 'slugify'
import readingTime from 'reading-time'
import type { Category } from '@/types'
import { evaluateFinanceArticle } from '@/lib/editorial-workflow'
import { resolvePostAuthorName } from '@/lib/authors'

function safeString(value: any = '') {
  return String(value || '')
}

export const CASHCLIMB_CATEGORIES: Category[] = [
  'Personal Finance',
  'Credit',
  'Investing',
  'Retirement',
  'Taxes',
  'Real Estate',
]

type KeywordIdea = {
  keyword: string
  category: Category
  intent: string
  priority: number
  brief: Record<string, unknown>
}

type DraftInput = {
  keyword: string
  category: Category
  intent?: string | null
  brief?: Record<string, any> | null
}

const SEEDS: Record<Category, string[]> = {
  'Personal Finance': [
    'how to save money fast without cutting everything',
    'monthly budget checklist for beginners',
    'emergency fund mistakes to avoid',
    'how to stop living paycheck to paycheck',
    'best sinking fund categories for families',
    'simple money habits that build savings',
  ],
  Credit: [
    'how to improve credit score safely',
    'credit utilization explained for beginners',
    'debt payoff mistakes that hurt credit',
    'how balance transfers work',
    'secured credit card guide for beginners',
    'credit report errors checklist',
  ],
  Investing: [
    'index funds for beginners',
    'etf investing mistakes beginners make',
    'dollar cost averaging explained',
    'how to start investing with little money',
    'investment risk tolerance guide',
    'brokerage account checklist for beginners',
  ],
  Retirement: [
    'retirement savings by age guide',
    'ira vs 401k for beginners',
    'how employer matching works',
    'retirement planning mistakes in your 30s',
    'compound interest retirement example',
    'catch up contributions explained',
  ],
  Taxes: [
    'tax documents checklist for freelancers',
    'common tax deductions beginners miss',
    'quarterly taxes explained simply',
    'how to organize receipts for taxes',
    'tax refund mistakes to avoid',
    'side hustle taxes checklist',
  ],
  'Real Estate': [
    'first time homebuyer budget checklist',
    'mortgage affordability mistakes',
    'rent vs buy checklist',
    'closing costs explained for beginners',
    'house down payment savings plan',
    'hidden costs of homeownership',
  ],
}

const MODIFIERS = [
  '2026 guide',
  'beginner checklist',
  'mistakes to avoid',
  'simple framework',
  'step by step',
]

const CITATION_SOURCES: Record<Category, string[]> = {
  'Personal Finance': ['Consumer Financial Protection Bureau', 'Federal Reserve', 'Bureau of Labor Statistics'],
  Credit: ['Consumer Financial Protection Bureau', 'Federal Trade Commission', 'FICO education resources'],
  Investing: ['SEC Investor.gov', 'FINRA', 'Federal Reserve'],
  Retirement: ['IRS retirement resources', 'Social Security Administration', 'SEC Investor.gov'],
  Taxes: ['IRS', 'Treasury Department', 'Small Business Administration'],
  'Real Estate': ['Consumer Financial Protection Bureau', 'Federal Housing Finance Agency', 'U.S. Census Bureau'],
}

function cleanKeyword(value: any) {
  return safeString(value).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ').trim()
}

export function generateKeywordIdeas(input?: {
  focus?: Category | 'Mixed' | string | null
  howMany?: number | string | null
  audience?: string | null
  intentMix?: string | null
  market?: string | null
  riskTolerance?: string | null
}): KeywordIdea[] {
  const requested = Math.min(50, Math.max(1, Number(input?.howMany ?? 20) || 20))
  const focus = input?.focus && input.focus !== 'Mixed' && CASHCLIMB_CATEGORIES.includes(input.focus as Category)
    ? [input.focus as Category]
    : CASHCLIMB_CATEGORIES

  const ideas: KeywordIdea[] = []
  for (const category of focus) {
    for (const seed of SEEDS[category]) {
      ideas.push(buildKeywordIdea(seed, category, input))
      for (const modifier of MODIFIERS) {
        ideas.push(buildKeywordIdea(`${seed} ${modifier}`, category, input))
      }
    }
  }

  return ideas
    .filter((idea, index, all) => all.findIndex((other) => other.keyword === idea.keyword && other.category === idea.category) === index)
    .sort((a, b) => a.priority - b.priority || a.keyword.localeCompare(b.keyword))
    .slice(0, requested)
}

function buildKeywordIdea(keyword: string, category: Category, input?: any): KeywordIdea {
  const clean = cleanKeyword(keyword)
  const intent = inferIntent(clean, input?.intentMix)
  const scoreBoost = /checklist|mistakes|beginner|step by step|explained|guide/.test(clean) ? 0 : 12
  return {
    keyword: clean,
    category,
    intent,
    priority: 20 + scoreBoost + Math.min(40, clean.length),
    brief: buildBrief(clean, category, intent, input),
  }
}

function inferIntent(keyword: string, requested?: string | null) {
  const request = (requested || '').toLowerCase()
  if (request && request !== 'mixed') return request
  if (/vs|compare|comparison/.test(keyword)) return 'comparison'
  if (/mistake|avoid/.test(keyword)) return 'mistakes'
  if (/checklist/.test(keyword)) return 'checklist'
  if (/how to|step by step/.test(keyword)) return 'how-to'
  return 'informational'
}

export function buildBrief(keyword: string, category: Category, intent = 'informational', input?: any) {
  return {
    keyword,
    category,
    intent,
    audience: input?.audience || 'Beginners',
    market: input?.market || 'US-focused with general Western audience framing',
    riskTolerance: input?.riskTolerance || 'Low',
    requiredSections: [
      'Key Takeaways',
      `What ${keyword} means`,
      'Step-by-step framework',
      'Common mistakes',
      'Example',
      'Tools and accounts that can help',
      'FAQ',
      'What you can do next',
    ],
    citationTargets: CITATION_SOURCES[category],
    internalLinkPlan: ['Add 1 to 3 related CashClimb guides once matching posts exist.'],
    safetyRules: [
      'Use educational language only.',
      'Do not promise outcomes or guaranteed returns.',
      'Avoid personalized financial, tax, investment, or legal advice.',
    ],
  }
}

function sentenceCase(keyword: any) {
  const clean = safeString(keyword)
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

function titleCase(keyword: any) {
  return safeString(keyword).split(' ').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}


function buildTitle(keyword: string, intent?: string | null) {
  const topic = titleCase(keyword).replace(/:\s*$/, '').trim()
  const normalizedIntent = (intent || '').toLowerCase()

  if (/checklist/.test(keyword) || normalizedIntent === 'checklist') return `${topic}: Step-by-Step Checklist`
  if (/mistake|avoid/.test(keyword) || normalizedIntent === 'mistakes') return `${topic}: Mistakes to Avoid`
  if (/vs|compare|comparison/.test(keyword) || normalizedIntent === 'comparison') return `${topic}: Which Option Makes More Sense?`
  if (/how to/.test(keyword) || normalizedIntent === 'how-to') return `${topic}: Step-by-Step Guide`
  return `${topic}: Clear Guide for Beginners`
}

function buildSeoTitle(keyword: string, intent?: string | null) {
  const title = buildTitle(keyword, intent)
  return title.replace(/:\s*Which Option Makes More Sense\?$/, ': Comparison Guide')
}

function trim(text: any, max: number) {
  const clean = safeString(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trimEnd() + '…'
}

function paragraph(text: any) {
  return `<p>${safeString(text)}</p>`
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
}

function resourceLinks(category: Category) {
  const resources: Record<Category, { title: string; href: string }[]> = {
    'Personal Finance': [
      { title: 'CFPB consumer finance guides', href: 'https://www.consumerfinance.gov/consumer-tools/' },
      { title: 'FDIC Money Smart', href: 'https://www.fdic.gov/resources/consumers/money-smart/' },
    ],
    Credit: [
      { title: 'CFPB credit card resources', href: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },
      { title: 'FTC credit and debt guidance', href: 'https://consumer.ftc.gov/credit-loans-debt' },
    ],
    Investing: [
      { title: 'SEC Investor.gov', href: 'https://www.investor.gov/' },
      { title: 'FINRA investor education', href: 'https://www.finra.org/investors' },
    ],
    Retirement: [
      { title: 'IRS retirement plans', href: 'https://www.irs.gov/retirement-plans' },
      { title: 'SEC Investor.gov retirement resources', href: 'https://www.investor.gov/additional-resources/retirement-toolkit' },
      { title: 'Social Security Administration', href: 'https://www.ssa.gov/' },
    ],
    Taxes: [
      { title: 'IRS individuals', href: 'https://www.irs.gov/individuals' },
      { title: 'IRS tax withholding estimator', href: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
    ],
    'Real Estate': [
      { title: 'CFPB buying a house', href: 'https://www.consumerfinance.gov/owning-a-home/' },
      { title: 'HUD homebuying resources', href: 'https://www.hud.gov/topics/buying_a_home' },
    ],
  }
  return `<ul>${resources[category].map((r) => `<li><a href=\"${r.href}\" target=\"_blank\" rel=\"noopener noreferrer\">${r.title}</a></li>`).join('')}</ul>`
}

function faqQuestions(category: Category) {
  const faqs: Record<Category, string[]> = {
    'Personal Finance': ['What should I review before changing my budget?', 'How do I know if a money move is too risky?', 'When should I get professional help?'],
    Credit: ['Which credit card fees are easiest to avoid?', 'How can I reduce interest charges?', 'When should I get professional help?'],
    Investing: ['How much investment risk is reasonable for beginners?', 'Should beginners avoid high-risk investments completely?', 'When should I get professional help?'],
    Retirement: ['What should beginners review before opening a retirement account?', 'Should conservative investors avoid stocks completely?', 'When should I get professional help?'],
    Taxes: ['What records should I check first?', 'When do tax rules change the decision?', 'When should I get professional help?'],
    'Real Estate': ['What costs should buyers compare first?', 'How much risk is too much for a housing decision?', 'When should I get professional help?'],
  }
  return faqs[category]
}

export function buildArticleDraft(input: DraftInput) {
  const keyword = cleanKeyword(input.keyword)
  const category = input.category
  const title = trim(buildTitle(keyword, input.intent), 70)
  const seoTitle = trim(buildSeoTitle(keyword, input.intent), 65)
  const excerpt = trim(`Learn ${keyword} with a clear checklist, practical examples, common mistakes, and safe next steps for everyday money decisions.`, 155)
  const seoDescription = trim(`A practical guide to ${keyword}, including key takeaways, examples, common mistakes, tools, FAQs, and responsible next steps.`, 155)
  const author = resolvePostAuthorName({ title, category })
  const citations = CITATION_SOURCES[category]
  const needsDisclaimer = ['Taxes', 'Investing', 'Retirement', 'Real Estate'].includes(category)
  const disclaimer = needsDisclaimer
    ? paragraph('<em>This article is for general educational purposes and is not personal financial, investment, tax, or legal advice.</em>')
    : ''

  const faq = faqQuestions(category)
  const html = [
    disclaimer,
    paragraph(`This guide explains the main choices, costs, and risks to compare before making a decision. The goal is not to chase a perfect answer. It is to help you understand the tradeoffs and choose a step that fits your cash flow, timeline, and comfort with risk.`),
    '<h2>Key Takeaways</h2>',
    list([
      'Start by comparing costs, timing, risk, and current cash flow together.',
      'Use a simple checklist before acting instead of relying on one headline number.',
      'Check current rules from reliable sources when the decision involves taxes, credit, investing, retirement, or housing.',
    ]),
    '<h2>What this means</h2>',
    paragraph('Small details can change the outcome. Fees, interest rates, account rules, tax treatment, deadlines, and timing may all matter. A useful plan explains those details clearly instead of making broad promises.'),
    paragraph('The practical question is simple: what action improves your position without creating a bigger problem later? That keeps the advice grounded and easier to act on.'),
    '<h2>A simple framework to use</h2>',
    list([
      'Define the goal: save money, reduce risk, improve cash flow, build credit, or plan ahead.',
      'Gather your numbers: income, expenses, balances, rates, deadlines, account limits, and fees.',
      'Compare speed, safety, flexibility, taxes, and long-term impact.',
      'Choose one next step that can be completed this week.',
      'Review the result before making bigger moves.',
    ]),
    paragraph('For example, if two choices look similar, the better option may depend on a fee, a deadline, or how easily you can reverse the decision later. That is why a checklist often beats a quick guess.'),
    '<h2>Common mistakes to avoid</h2>',
    list([
      'Making a decision before knowing the full cost.',
      'Focusing only on monthly payments while ignoring total cost.',
      'Following generic advice that does not match your timeline or risk tolerance.',
      'Ignoring taxes, fees, or account rules.',
      'Assuming an outcome is guaranteed.',
    ]),
    '<h2>What to verify before acting</h2>',
    paragraph(`Check current rules and data from reliable sources such as ${citations.join(', ')}. This helps avoid stale advice and unsupported claims.`),
    '<h2>Helpful official resources</h2>',
    resourceLinks(category),
    '<h2>FAQ</h2>',
    `<h3>${faq[0]}</h3>`,
    paragraph('Start with the costs, timing, risks, and rules that could change the outcome. Then compare the safest realistic options side by side.'),
    `<h3>${faq[1]}</h3>`,
    paragraph('Risk is too high when the decision could damage essential expenses, emergency savings, credit, tax position, or long-term flexibility.'),
    `<h3>${faq[2]}</h3>`,
    paragraph('Consider professional help when a decision involves taxes, investments, legal documents, large debt balances, home purchases, retirement accounts, or business income.'),
    '<h2>Next steps</h2>',
    paragraph('Pick one practical decision, gather the numbers, and compare the tradeoffs before acting. A small, well-informed step is better than a rushed move that creates new problems.'),
  ].filter(Boolean).join('\n')

  const readTime = readingTime(html.replace(/<[^>]*>/g, ' ')).text
  const evaluation = evaluateFinanceArticle({
    title,
    excerpt,
    body: html,
    primaryKeyword: keyword,
    category,
    seoTitle,
    seoDescription,
    coverUrl: null,
  })

  return {
    title,
    slug: slugify(keyword, { lower: true, strict: true }),
    excerpt,
    body: html,
    category,
    author,
    read_time: readTime,
    primary_keyword: keyword,
    related_keywords: relatedKeywords(keyword, category),
    seo_title: seoTitle,
    seo_description: seoDescription,
    status: evaluation.passed ? 'approved' : 'review_required',
    published: false,
    quality_score: evaluation.score,
    risk_level: evaluation.risk_level,
    review_notes: evaluation.checks.filter((check) => !check.passed).map((check) => `${check.name}: ${check.details}`).join('\n'),
    workflow_meta: {
      automation: true,
      brief: input.brief || buildBrief(keyword, category, input.intent || 'informational'),
      generatedAt: new Date().toISOString(),
    },
    evaluation,
  }
}

function toolIdeas(category: Category) {
  const common = ['A simple spreadsheet or tracker for the numbers.', 'A reminder system for dates, bills, or review points.']
  const byCategory: Record<Category, string[]> = {
    'Personal Finance': ['A budget worksheet.', 'A high-yield savings comparison checklist.'],
    Credit: ['A credit report review checklist.', 'A debt payoff calculator.'],
    Investing: ['A fee comparison checklist.', 'An allocation review worksheet.'],
    Retirement: ['A contribution tracker.', 'A retirement projection calculator.'],
    Taxes: ['A receipt folder system.', 'A quarterly tax calendar.'],
    'Real Estate': ['A mortgage affordability calculator.', 'A closing-cost worksheet.'],
  }
  return [...byCategory[category], ...common]
}

function relatedKeywords(keyword: any, category: Category) {
  const words = safeString(keyword).split(' ').filter((word) => word.length > 3).slice(0, 4)
  return Array.from(new Set([
    ...words,
    category.toLowerCase(),
    'checklist',
    'beginner guide',
    'common mistakes',
  ]))
}
