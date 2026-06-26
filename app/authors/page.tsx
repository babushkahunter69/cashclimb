import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AUTHORS } from '@/lib/authors'

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://cashclimb.org').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'CashClimb Authors and Editorial Team',
  description:
    'Meet the CashClimb contributors and editorial team behind our personal finance, investing, credit, and money management guides.',
  alternates: {
    canonical: `${siteUrl}/authors`,
  },
}

export default function AuthorsPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <section className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
            Authors
          </p>
          <h1 className="font-serif text-4xl font-black leading-tight text-[#F0EDE8] md:text-5xl">
            The people and process behind CashClimb guides
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#B7B0AA]">
            CashClimb uses contributor profiles and editorial review notes so readers
            can understand who wrote a guide, what area it covers, and how it is framed.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {AUTHORS.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="rounded-3xl border border-border bg-bg-2 p-6 transition-colors hover:border-gold"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-[#111214] text-base font-black text-[#F0EDE8]">
                {author.initials}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gold">
                {author.schemaType === 'Organization' ? 'Editorial team' : 'Contributor'}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#F0EDE8]">
                {author.name}
              </h2>
              <p className="mt-1 text-sm text-[#9A9490]">{author.role}</p>
              <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-[#B7B0AA]">
                {author.intro}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {author.topics.slice(0, 3).map((topic) => (
                  <span key={topic} className="rounded-full border border-border px-2.5 py-1 text-xs text-[#9A9490]">
                    {topic}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-gold/25 bg-[rgba(212,175,55,0.05)] p-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
            Editorial review
          </p>
          <h2 className="font-serif text-3xl font-black text-[#F0EDE8]">
            Every article is written for education, not product placement.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#B7B0AA]">
            CashClimb reviews articles for clarity, usefulness, responsible financial
            framing, and visible limitations. We do not present general education as
            personalised financial, investment, tax, or legal advice.
          </p>
          <Link href="/editorial-standards" className="mt-5 inline-flex text-sm font-semibold text-gold hover:opacity-80">
            Read the standards →
          </Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
