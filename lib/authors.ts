export type AuthorProfile = {
  slug: string
  name: string
  role: string
  tagline: string
  intro: string
  bio: string[]
  topics: string[]
  initials: string
  schemaType: 'Person' | 'Organization'
}

export type AuthorResolvablePost = {
  title?: string | null
  category?: string | null
  author?: string | null
}

export const AUTHORS: AuthorProfile[] = [
  {
    slug: 'cashclimb-editorial',
    name: 'CashClimb Editorial',
    role: 'Editorial Review Team',
    tagline: 'Research-backed financial education with clear limits.',
    intro:
      'The CashClimb Editorial team reviews guides for clarity, usefulness, responsible framing, and clear disclaimers before publication.',
    bio: [
      'CashClimb Editorial is the review desk behind CashClimb guides, tools, and financial resources. The team checks whether an article answers a real reader question, explains tradeoffs clearly, and avoids overpromising.',
      'The review process focuses on saving, budgeting, banking, debt, credit, investing basics, and income growth. Articles are written for education only and are not a replacement for personal financial advice.',
      'CashClimb is built around a clear reader promise: no sponsored rankings, no product placement disguised as education, and no certainty where financial decisions require context.',
    ],
    topics: ['Editorial Review', 'Financial Education', 'Disclaimers', 'Reader Trust', 'No Sponsored Rankings'],
    initials: 'CE',
    schemaType: 'Organization',
  },
  {
    slug: 'daniel-reeves',
    name: 'Daniel Reeves',
    role: 'Personal Finance Writer',
    tagline: 'Helping readers save more, budget better, and earn on the side.',
    intro:
      'Daniel writes practical money guides focused on budgeting, savings, debt reduction, side hustles, and everyday financial habits.',
    bio: [
      'Daniel Reeves covers practical money systems for readers who want clearer day-to-day financial decisions. His articles focus on budgeting, saving, emergency funds, debt decisions, spending habits, and realistic side income ideas.',
      'His writing style is step-by-step and example-driven. Instead of promising quick wins, Daniel focuses on what a reader can realistically change, track, and improve over time.',
      'Daniel’s CashClimb articles are reviewed by the CashClimb Editorial team for clarity, usefulness, and responsible financial framing before publication.',
    ],
    topics: ['Budgeting', 'Saving', 'Debt', 'Side Hustles', 'Money Habits'],
    initials: 'DR',
    schemaType: 'Person',
  },
  {
    slug: 'sophie-tran',
    name: 'Sophie Tran',
    role: 'Credit and Banking Writer',
    tagline: 'Smart credit, banking, tax organization, and modern money tools.',
    intro:
      'Sophie covers credit, banking, tax organization, payment apps, scam awareness, and practical tools for managing money safely.',
    bio: [
      'Sophie Tran writes about the systems readers use to manage money: credit, banking, tax organization, payment apps, account comparisons, and scam prevention.',
      'Her work focuses on helping readers understand terms, risks, fees, records, and warning signs before choosing a financial tool or changing how they manage money.',
      'Sophie’s CashClimb articles are reviewed for clear explanations, practical usefulness, and responsible limits. Her content is educational and should not be treated as personalised financial, tax, or legal advice.',
    ],
    topics: ['Credit', 'Banking', 'Taxes', 'Financial Tools', 'Scam Prevention'],
    initials: 'ST',
    schemaType: 'Person',
  },
  {
    slug: 'jordan-lee',
    name: 'Jordan Lee',
    role: 'Investing and Retirement Writer',
    tagline: 'Plain-English investing, retirement, and long-term planning guidance.',
    intro:
      'Jordan writes plain-English guides on investing basics, retirement planning, pensions, superannuation, property decisions, and long-term wealth tradeoffs.',
    bio: [
      'Jordan Lee covers long-term money decisions where readers often need context before taking action. His topics include investing basics, retirement accounts, pensions, superannuation, index funds, property tradeoffs, and long-term planning.',
      'His articles are designed to explain concepts, compare tradeoffs, and show where individual circumstances matter. Jordan avoids treating general rules of thumb as universal advice.',
      'Jordan’s CashClimb articles are reviewed by the CashClimb Editorial team for clarity, usefulness, and responsible financial context before publication.',
    ],
    topics: ['Investing', 'Retirement', 'Pensions', 'Superannuation', 'Long-Term Planning'],
    initials: 'JL',
    schemaType: 'Person',
  },
]

export function getAuthorBySlug(slug: string) {
  return AUTHORS.find((author) => author.slug === slug)
}

export function getAuthorByName(name?: string | null) {
  const normalized = (name || 'CashClimb Editorial').trim().toLowerCase()

  return (
    AUTHORS.find((author) => author.name.toLowerCase() === normalized) ||
    AUTHORS.find((author) => author.slug === 'cashclimb-editorial')!
  )
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term))
}

function isEditorialOrBlank(author?: string | null) {
  const normalized = (author || '').trim().toLowerCase()
  return !normalized || normalized.includes('editorial') || normalized === 'cashclimb'
}

export function resolvePostAuthorName(post: AuthorResolvablePost) {
  const title = (post.title || '').toLowerCase()
  const category = (post.category || '').toLowerCase()
  const combined = `${title} ${category}`

  if (
    containsAny(combined, [
      'pension',
      'pensions',
      'superannuation',
      'retirement',
      'ira',
      'index fund',
      'index funds',
      'investing',
      'investment',
      'investor',
      'real estate',
      'property',
      'mortgage',
      'wealth',
      'long-term',
      'long term',
    ])
  ) {
    return 'Jordan Lee'
  }

  if (
    containsAny(combined, [
      'tax',
      'taxes',
      'freelancer tax',
      'credit',
      'bank',
      'banking',
      'scam',
      'scams',
      'payment app',
      'online bank',
      'checking account',
      'tools',
      'app',
      'apps',
    ])
  ) {
    return 'Sophie Tran'
  }

  if (
    containsAny(combined, [
      'budget',
      'budgeting',
      'debt',
      'saving',
      'savings',
      'save',
      'cash',
      'emergency fund',
      'paycheck',
      'holiday spending',
      'house deposit',
      'side hustle',
      'side hustles',
      'income',
      'money habits',
      'money management',
    ])
  ) {
    return 'Daniel Reeves'
  }

  if (!isEditorialOrBlank(post.author)) {
    return post.author!.trim()
  }

  return 'Daniel Reeves'
}
