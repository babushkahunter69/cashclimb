import { createAdminClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Ticker from '@/components/Ticker'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import type { Post } from '@/types'
import { getAuthorByName, resolvePostAuthorName } from '@/lib/authors'
import type { Metadata } from 'next'
import Image from 'next/image'
import { displayTitle } from '@/lib/seo/clean-title'
import { localizeCoverUrl } from '@/lib/images'

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://cashclimb.org').replace(/\/$/, '')
const socialImage = '/opengraph-image'

export const metadata: Metadata = {
  title: 'CashClimb: Personal Finance and Investing Guides',
  description:
    'Clear, jargon-free financial insights on investing, personal finance, credit, and wealth-building for people who take their financial future seriously.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CashClimb: Personal Finance and Investing Guides',
    description:
      'Clear, jargon-free financial insights on investing, personal finance, credit, and wealth-building for people who take their financial future seriously.',
    url: siteUrl,
    type: 'website',
    images: [{ url: socialImage, width: 1200, height: 630, alt: 'CashClimb' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CashClimb: Personal Finance and Investing Guides',
    description:
      'Clear, jargon-free financial insights on investing, personal finance, credit, and wealth-building for people who take their financial future seriously.',
    images: [socialImage],
  },
}

const CAT_COLORS: Record<string, string> = {
  Investing: '#D4AF37',
  'Personal Finance': '#4A9B8E',
  Credit: '#C4704A',
  Taxes: '#7B68D4',
  'Real Estate': '#5A8C5A',
  Retirement: '#C46A8A',
}

export const revalidate = 60

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function HomePage() {
  const supabase = createAdminClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  const allPosts: Post[] = posts ?? []
  const [heroPost, ...rest] = allPosts

  const heroAuthor = heroPost
    ? getAuthorByName(resolvePostAuthorName(heroPost))
    : null

  return (
    <>
      <Navbar />
      <Ticker />

      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(212,175,55,0.07),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.20em] text-gold sm:text-xs sm:tracking-[0.24em]">
              Independent financial education
            </p>

            <h1 className="max-w-[11ch] font-serif text-[3.35rem] font-black leading-[0.98] text-[#F0EDE8] sm:max-w-4xl sm:text-5xl sm:leading-[1.04] lg:text-6xl">
              Make smarter money decisions without second guessing every step.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#B7B0AA] sm:mt-6 sm:text-lg">
              Clear guides on credit, investing, debt, retirement, property, and everyday money choices, written for readers who want practical next steps.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <Link href="/blog" className="cc-btn-primary inline-block">
                Browse guides
              </Link>
              <Link href="/editorial-standards" className="cc-btn-ghost inline-block">
                Editorial standards
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#9A9490] sm:mt-8">
              {['No sponsored rankings', 'No ads or paywalls', 'Reviewed for clarity'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block lg:max-w-xl lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-bg-2/70 shadow-xl">
              <div className="relative aspect-[16/9]">
                <Image
                  src={localizeCoverUrl(heroPost?.cover_url, heroPost?.category)}
                  alt={heroPost ? displayTitle(heroPost.title) : 'CashClimb financial guide visual'}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="p-7">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="cat-badge bg-gold text-bg">Featured guide</span>
                  {heroPost ? (
                    <span
                      className="cat-badge"
                      style={{
                        background: `${CAT_COLORS[heroPost.category]}22`,
                        color: CAT_COLORS[heroPost.category],
                      }}
                    >
                      {heroPost.category}
                    </span>
                  ) : null}
                </div>

                <h2 className="font-serif text-xl font-bold leading-snug text-[#F0EDE8] sm:text-2xl">
                  {heroPost ? displayTitle(heroPost.title) : 'Thoughtful personal finance guidance, built for trust.'}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#B7B0AA]">
                  {heroPost?.excerpt || 'Publish your first reviewed guide to highlight it here.'}
                </p>

                {heroPost ? (
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 text-sm text-[#9A9490]">
                    <span>By {heroAuthor?.name || 'CashClimb Editorial'}</span>
                    <span>{formatDate(heroPost.updated_at || heroPost.created_at)}</span>
                    <span>{heroPost.read_time}</span>
                    <Link href={`/blog/${heroPost.slug}`} className="font-semibold text-gold hover:text-gold-light">
                      Read guide
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-2/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold">
              How CashClimb works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#F0EDE8]">
              Useful first, polished second.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              'Every guide answers a real financial decision.',
              'Content is updated when conditions materially change.',
              'No sponsored placements or paid rankings.',
              'Written for clarity, not complexity.',
            ].map((item) => (
              <div key={item} className="border-t border-border pt-4 text-sm leading-relaxed text-[#B7B0AA]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold section-title">
              Latest Articles
            </h2>
            <Link
              href="/blog"
              className="text-gold text-sm font-semibold hover:text-gold-light transition-colors"
            >
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}