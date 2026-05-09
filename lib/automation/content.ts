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
  'step by step',
]

const SOURCE_LINKS: Record<Category, { title: string; href: string }[]> = {
  'Personal Finance': [
    { title: 'CFPB consumer tools', href: 'https://www.consumerfinance.gov/consumer-tools/' },
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
    { title: 'SEC Investor.gov retirement toolkit', href: 'https://www.investor.gov/additional-resources/retirement-toolkit' },
  ],
  Taxes: [
    { title: 'IRS individuals', href: 'https://www.irs.gov/individuals' },
    { title: 'IRS tax withholding estimator', href: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
  ],
  'Real Estate': [
    { title: 'CFPB home buying guide', href: 'https://www.consumerfinance.gov/owning-a-home/' },
    { title: 'HUD homebuying resources', href: 'https://www.hud.gov/topics/buying_a_home' },
  ],
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
      for (const modifier of MODIFIERS) ideas.push(buildKeywordIdea(`${seed} ${modifier}`, category, input))
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
      'Key takeaways',
      'Why it matters',
      'How it works',
      'Example',
      'Common mistakes',
      'FAQ',
      'Bottom line',
    ],
    citationTargets: SOURCE_LINKS[category].map((source) => source.title),
    internalLinkPlan: ['Add only contextual CashClimb links that directly help the reader.'],
    safetyRules: [
      'Stay tightly anchored to the article topic.',
      'Do not add generic finance frameworks just to increase word count.',
      'Do not promise outcomes or guaranteed returns.',
      'Avoid personalized financial, tax, investment, or legal advice.',
    ],
  }
}

function titleCase(keyword: any) {
  return safeString(keyword).split(' ').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function naturalTopic(keyword: string) {
  return keyword
    .replace(/^how to\s+/i, '')
    .replace(/\b2026 guide\b/gi, '')
    .replace(/\bbeginner checklist\b/gi, '')
    .replace(/\bstep by step\b/gi, '')
    .replace(/\bsimple framework\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildTitle(keyword: string, intent?: string | null) {
  const topic = titleCase(naturalTopic(keyword)).replace(/:\s*$/, '').trim()
  const normalizedIntent = (intent || '').toLowerCase()

  if (/mistake|avoid/.test(keyword) || normalizedIntent === 'mistakes') return `${topic}: What to Watch For`
  if (/checklist/.test(keyword) || normalizedIntent === 'checklist') return `${topic}: Practical Checklist`
  if (/vs|compare|comparison/.test(keyword) || normalizedIntent === 'comparison') return `${topic}: How to Compare the Options`
  if (/how to/.test(keyword) || normalizedIntent === 'how-to') return `${topic}: Step-by-Step Guide`
  return `${topic}: Beginner Guide`
}

function buildSeoTitle(keyword: string, intent?: string | null) {
  return buildTitle(keyword, intent).slice(0, 65)
}

function trim(text: any, max: number) {
  const clean = safeString(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trimEnd() + '…'
}

function paragraph(text: any) {
  return `<p>${safeString(text)}</p>`
}

function sourceParagraph(category: Category) {
  const first = SOURCE_LINKS[category][0]
  return paragraph(`For current rules and consumer guidance, verify details with <a href="${first.href}" target="_blank" rel="noopener noreferrer">${first.title}</a> before acting.`)
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
}

type TopicProfile = {
  plain: string
  intro: string
  takeaways: string[]
  why: string[]
  stepsHeading: string
  steps: string[]
  example: string[]
  mistakes: string[]
  faq: Array<[string, string]>
  bottom: string
}

function genericProfile(keyword: string, category: Category): TopicProfile {
  const topic = naturalTopic(keyword)
  return {
    plain: topic,
    intro: `${titleCase(topic)} is easier to handle when the article stays focused on the actual choice, the numbers involved, and the risk of getting the timing or cost wrong.`,
    takeaways: [
      `Define what ${topic} changes in real life before comparing options.`,
      'Check the cost, timing, fees, rules, and downside before acting.',
      'Use one realistic example rather than relying on a broad rule of thumb.',
    ],
    why: [
      `The main risk with ${topic} is usually not one dramatic mistake. It is a small assumption that changes the outcome, such as a fee, rate, deadline, tax rule, or account restriction.`,
      `A useful guide should explain what to check, what can go wrong, and how a beginner can take the next step without turning the topic into generic ${category.toLowerCase()} advice.`,
    ],
    stepsHeading: `How to approach ${topic}`,
    steps: [
      'Write down the exact action you are considering.',
      'List the numbers that affect the result.',
      'Compare at least two realistic options.',
      'Look for the downside before choosing.',
      'Verify current rules if the topic involves accounts, taxes, credit, or government programs.',
    ],
    example: [
      `For example, a reader dealing with ${topic} might see one option that looks easier today and another that is slower but cheaper or safer. The better choice depends on the numbers, not the label attached to the option.`,
      'That is why the article should show the tradeoff directly instead of adding broad advice that could apply to any money topic.',
    ],
    mistakes: [
      'Comparing only one headline number.',
      'Ignoring fees, timing, account rules, or penalties.',
      'Assuming the same answer works for every reader.',
      'Making the next step too large to keep up consistently.',
    ],
    faq: [
      ['What should I compare first?', 'Start with total cost, timing, flexibility, downside risk, and whether the choice can be changed later without major damage.'],
      ['Does the same answer work for everyone?', 'No. Income, debt, account rules, location, tax position, and time horizon can all change the right next step.'],
      ['When should I get professional help?', 'Consider qualified help when the decision involves taxes, investments, retirement accounts, property, legal documents, business income, or large debt balances.'],
    ],
    bottom: `Use ${topic} as a specific decision, not a vague theme. Gather the numbers, compare the realistic options, and choose the smallest step that improves your position without adding unnecessary risk.`,
  }
}

function profileFor(keyword: string, category: Category): TopicProfile {
  const k = keyword.toLowerCase()

  if (/employer match|401k match|401\(k\) match/.test(k)) {
    return {
      plain: 'employer match',
      intro: 'An employer match is part of your compensation. The goal is to understand the match formula, contribute enough to capture it when possible, and avoid cash-flow problems while you build the habit.',
      takeaways: [
        'Find the match formula before choosing a contribution rate.',
        'Check vesting rules so you know when matched dollars are fully yours.',
        'Increase contributions gradually if jumping to the full match would strain cash flow.',
      ],
      why: [
        'A match can change the first step for a beginner investor because it may add money to the account only when you contribute. Missing the formula can mean leaving compensation unused.',
        'The important details are the match percentage, pay-period rules, annual limits, investment options, fees, and vesting schedule.',
      ],
      stepsHeading: 'A simple 90-day plan',
      steps: ['Week 1: read the plan summary and write down the match formula.', 'Weeks 2 to 4: choose a contribution rate that does not break your monthly budget.', 'Month 2: review investment options and avoid high-fee choices when lower-cost diversified options exist.', 'Month 3: check your first statements and confirm the match is posting correctly.'],
      example: ['If your employer matches 50% of contributions up to 6% of pay, contributing only 3% may capture only part of the available match. Increasing toward 6% over time can help, but only if your cash flow can handle it.', 'The right pace depends on your emergency fund, high-interest debt, and how stable your income is.'],
      mistakes: ['Not reading the match formula.', 'Missing vesting rules.', 'Stopping contributions after one tight month instead of adjusting the rate.', 'Choosing investments without checking fees.'],
      faq: [['Should I contribute enough to get the full match?', 'Often that is worth considering, but only after checking cash flow, debt, emergency savings, and plan rules.'], ['What is vesting?', 'Vesting determines when employer contributions fully belong to you. Your own contributions are generally yours, but employer contributions may follow a schedule.'], ['Where can I check contribution limits?', 'Check current retirement plan limits through official IRS resources.']],
      bottom: 'Start by finding the match formula. Then choose a contribution rate you can keep, confirm the match appears on your statement, and increase gradually if your budget allows.',
    }
  }

  if (/mortgage affordability/.test(k)) {
    return {
      plain: 'mortgage affordability',
      intro: 'Mortgage affordability is not just the payment a lender approves. A safer estimate includes taxes, insurance, maintenance, closing costs, income stability, existing debt, and the cash you still need after moving in.',
      takeaways: ['Approval amount is not the same as a comfortable housing budget.', 'Taxes, insurance, repairs, HOA fees, and closing costs can change the real monthly cost.', 'A buyer should test the payment against income changes, rate changes, and emergency savings.'],
      why: ['The biggest affordability mistake is treating the mortgage payment as the whole cost of owning a home. That misses the expenses that show up after closing.', 'A useful affordability check looks at the full housing cost and asks whether the buyer can still save, handle repairs, and manage other debt.'],
      stepsHeading: 'How to check affordability before buying',
      steps: ['Start with take-home pay, not gross income.', 'Add principal, interest, property taxes, insurance, HOA fees, utilities, and maintenance.', 'Estimate closing costs and the cash needed after closing.', 'Check how the payment feels if income drops or another major bill appears.', 'Compare the result with renting or buying a smaller home.'],
      example: ['A buyer may be approved for a payment that technically fits lender ratios but leaves little room for repairs or savings. If the roof, car, or job situation changes, the affordable-looking payment can become stressful quickly.', 'A lower purchase price or larger cash reserve may be more useful than stretching to the maximum approval amount.'],
      mistakes: ['Using lender approval as the budget.', 'Ignoring taxes, insurance, HOA fees, repairs, and utilities.', 'Spending all cash at closing.', 'Assuming income will only go up.', 'Forgetting moving costs and furniture.'],
      faq: [['Is mortgage preapproval the same as affordability?', 'No. Preapproval is a lender estimate. Affordability is whether the full cost fits your real budget after savings, debt, repairs, and other priorities.'], ['How much should I keep after closing?', 'There is no single number, but buyers usually need cash left for emergencies, repairs, moving costs, and normal bills.'], ['What source should I check before buying?', 'Review current homebuying guidance from the CFPB and compare loan estimates carefully.']],
      bottom: 'Do not start with the maximum loan amount. Start with the monthly payment you can handle after taxes, insurance, repairs, savings, and ordinary life are included.',
    }
  }

  if (/automating savings|automatic savings/.test(k)) {
    return {
      plain: 'automatic savings',
      intro: 'Automating savings can help because money moves before you have to make a new decision every payday. The risk is that transfers can also cause overdrafts or hide a budget problem if the amount is too aggressive.',
      takeaways: ['Automation works best when the transfer amount matches real cash flow.', 'Payday transfers are usually safer than random monthly dates.', 'Review the setup after bills, income, or account balances change.'],
      why: ['The benefit of automation is consistency. It removes the need to remember every transfer and makes saving feel like part of the normal bill cycle.', 'The downside is rigidity. If income is irregular or bills hit before the transfer, automation can move money at the wrong time.'],
      stepsHeading: 'How to set up automatic savings safely',
      steps: ['Pick one goal, such as emergency savings, a sinking fund, or a down payment.', 'Choose a small transfer that would not cause stress in a tight month.', 'Schedule it shortly after payday.', 'Keep a buffer in checking before increasing the amount.', 'Review the transfer after 30 to 60 days.'],
      example: ['If you are paid every other Friday, a small transfer the next morning is usually easier to manage than a large transfer on the first of the month. The money moves after income arrives, not before bills clear.', 'A $25 or $50 automatic transfer can be better than a $300 transfer that forces you to move money back later.'],
      mistakes: ['Automating too much too soon.', 'Scheduling transfers before income arrives.', 'Ignoring irregular bills.', 'Using one savings account for every goal.', 'Never reviewing the amount after income changes.'],
      faq: [['Is automating savings a good idea?', 'It can be, especially for steady income. Start small and make sure the transfer date fits your pay schedule.'], ['Can automation cause overdrafts?', 'Yes. That can happen if transfers are too large, scheduled too early, or not adjusted after bills increase.'], ['Should I automate emergency savings first?', 'For many beginners, a basic emergency fund is a practical first goal before saving for optional purchases.']],
      bottom: 'Start with a small payday transfer and review it after one or two months. Automation should make saving easier, not create overdraft risk or force you to reverse transfers.',
    }
  }

  return genericProfile(keyword, category)
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
  const profile = profileFor(keyword, category)
  const title = trim(buildTitle(keyword, input.intent), 70)
  const seoTitle = trim(buildSeoTitle(keyword, input.intent), 65)
  const excerpt = trim(`${profile.intro} This guide explains the practical checks, common mistakes, and next step.`, 155)
  const seoDescription = trim(`${profile.intro} Learn the key checks, examples, mistakes, FAQs, and safer next steps.`, 155)
  const author = resolvePostAuthorName({ title, category })
  const needsDisclaimer = ['Taxes', 'Investing', 'Retirement', 'Real Estate'].includes(category)
  const disclaimer = needsDisclaimer
    ? paragraph('<em>This article is for general educational purposes and is not personal financial, investment, tax, or legal advice.</em>')
    : ''

  const faq = profile.faq.length ? profile.faq : faqQuestions(category).map((q) => [q, 'The answer depends on your income, timeline, account rules, debt, and risk tolerance.'] as [string, string])
  const html = [
    disclaimer,
    paragraph(profile.intro),
    '<h2>Key takeaways</h2>',
    list(profile.takeaways),
    '<h2>Why this matters</h2>',
    ...profile.why.map(paragraph),
    `<h2>${profile.stepsHeading}</h2>`,
    list(profile.steps),
    '<h2>Example</h2>',
    ...profile.example.map(paragraph),
    '<h2>Common mistakes to avoid</h2>',
    list(profile.mistakes),
    '<h2>What to verify</h2>',
    sourceParagraph(category),
    '<h2>FAQ</h2>',
    ...faq.flatMap(([question, answer]) => [`<h3>${question}</h3>`, paragraph(answer)]),
    '<h2>Bottom line</h2>',
    paragraph(profile.bottom),
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
