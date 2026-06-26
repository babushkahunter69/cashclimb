import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AUTHORS } from '@/lib/authors'

export default function AboutPage() {
  const publicAuthors = AUTHORS.filter((author) => author.slug !== 'cashclimb-editorial')

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            About CashClimb
          </p>
          <h1 className="font-serif text-4xl font-black leading-[1.08] lg:text-5xl">
            Clear financial thinking,
            <br />
            <span className="text-gold">without the noise.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#9A9490]">
            CashClimb helps readers understand practical money decisions without
            hype, sponsored rankings, or product-first advice.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-border bg-bg-2 p-8">
            <h2 className="mb-4 font-serif text-2xl font-bold text-[#F0EDE8]">
              Why the site exists
            </h2>
            <p className="mb-4 leading-relaxed text-[#9A9490]">
              Most financial content is either too shallow to be useful or too
              technical to use in real life. CashClimb aims to sit in the middle:
              clear enough for beginners, serious enough for readers making real
              decisions.
            </p>
            <p className="leading-relaxed text-[#9A9490]">
              The goal is simple: help readers compare tradeoffs, understand risk,
              and take practical next steps with more confidence.
            </p>
          </section>

          <section className="rounded-2xl border border-gold/30 bg-[rgba(212,175,55,0.04)] p-8">
            <h2 className="mb-4 font-serif text-2xl font-bold text-[#F0EDE8]">
              Our reader promise
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                'No sponsored rankings or paid placement disguised as advice.',
                'Country-aware explanations where rules and account types differ.',
                'Clear disclaimers when a topic may require professional guidance.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-bg-2 p-5 text-sm leading-relaxed text-[#B7B0AA]">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-2 p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#F0EDE8]">
                  Who writes CashClimb
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#9A9490]">
                  CashClimb uses named contributor profiles so readers can see the
                  writer, focus area, and editorial scope behind each guide.
                </p>
              </div>
              <Link href="/authors" className="text-sm font-semibold text-gold hover:opacity-80">
                View all authors →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {publicAuthors.map((author) => (
                <Link
                  key={author.slug}
                  href={`/authors/${author.slug}`}
                  className="rounded-2xl border border-border bg-bg p-5 transition-colors hover:border-gold"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-[#111214] text-sm font-black text-[#F0EDE8]">
                    {author.initials}
                  </div>
                  <h3 className="font-bold text-[#F0EDE8]">{author.name}</h3>
                  <p className="mt-1 text-sm text-[#9A9490]">{author.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#B7B0AA]">
                    {author.intro}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-bg-2 p-8">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#F0EDE8]">
                What CashClimb covers
              </h2>
              <ul className="space-y-3 text-[#9A9490]">
                <li>• Investing and portfolio basics</li>
                <li>• Personal finance and debt decisions</li>
                <li>• Saving, budgeting, and money habits</li>
                <li>• Retirement and long-term planning</li>
                <li>• Property and finance tradeoffs</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-bg-2 p-8">
              <h2 className="mb-4 font-serif text-2xl font-bold text-[#F0EDE8]">
                How content is reviewed
              </h2>
              <p className="leading-relaxed text-[#9A9490]">
                Articles are checked for clarity, structure, usefulness, obvious
                overclaims, and responsible financial framing before publication.
                When material facts change, articles should be updated where needed.
              </p>
              <Link href="/editorial-standards" className="mt-5 inline-flex text-sm font-semibold text-gold hover:opacity-80">
                Read editorial standards →
              </Link>
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-bg-2 p-8">
            <h2 className="mb-4 font-serif text-2xl font-bold text-[#F0EDE8]">
              What CashClimb is not
            </h2>
            <p className="leading-relaxed text-[#9A9490]">
              CashClimb provides educational content and general financial
              commentary. It is not personalised financial advice, and it should
              not replace qualified professional guidance where tax, legal, or
              major financial consequences are involved.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
