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

export const AUTHORS: AuthorProfile[] = [
  {
    slug: 'cashclimb-editorial',
    name: 'CashClimb Editorial',
    role: 'Editorial Team',
    tagline: 'Research-backed financial guides for everyday Filipinos.',
    intro:
      'The CashClimb Editorial team creates clear, practical content to help readers save money, make smarter decisions, and grow financially with confidence.',
    bio: [
      'CashClimb Editorial is the in-house team behind CashClimb’s guides, tools, and financial resources. Our goal is to make money management easier, clearer, and more practical for everyday Filipinos.',
      'We research, review, and simplify topics like saving, budgeting, banking, and earning more so readers can take action with confidence. Our editorial approach focuses on clarity, usefulness, and advice that works in real life.',
    ],
    topics: ['Saving', 'Budgeting', 'Banking', 'Tools'],
    initials: 'CE',
    schemaType: 'Organization',
  },
  {
    slug: 'daniel-reeves',
    name: 'Daniel Reeves',
    role: 'Personal Finance Writer',
    tagline: 'Helping you save more and earn on the side.',
    intro:
      'Daniel writes practical money advice focused on better habits, stronger savings, and realistic ways to increase your income.',
    bio: [
      'Daniel Reeves writes about practical ways to save money, build better habits, and earn extra income. He focuses on simple, actionable strategies that readers can use in everyday life.',
      'His work covers budgeting systems, side hustles, and ways to improve your finances without overcomplicating the process. At CashClimb, Daniel aims to make financial growth feel realistic, motivating, and achievable.',
    ],
    topics: ['Budgeting', 'Saving', 'Side Hustles', 'Income'],
    initials: 'DR',
    schemaType: 'Person',
  },
  {
    slug: 'sophie-tran',
    name: 'Sophie Tran',
    role: 'Finance Writer',
    tagline: 'Smart budgeting, digital finance, and modern money tools.',
    intro:
      'Sophie covers budgeting, digital banking, and simple financial systems that help readers stay organized and in control.',
    bio: [
      'Sophie Tran focuses on budgeting, digital banking, and modern financial tools that make managing money easier. She breaks down complex ideas into clear, practical advice that readers can apply right away.',
      'Her work often explores apps, systems, and strategies that help people stay on top of their finances in a fast-moving digital world. At CashClimb, Sophie’s goal is to make modern money management feel simpler and less stressful.',
    ],
    topics: ['Budgeting', 'Banking', 'Apps', 'Tools'],
    initials: 'ST',
    schemaType: 'Person',
  },
]

export function getAuthorBySlug(slug: string) {
  return AUTHORS.find((author) => author.slug === slug)
}

export function getAuthorByName(name?: string) {
  const normalized = (name || 'CashClimb Editorial').trim().toLowerCase()

  return (
    AUTHORS.find((author) => author.name.toLowerCase() === normalized) ||
    AUTHORS.find((author) => author.slug === 'cashclimb-editorial')!
  )
}