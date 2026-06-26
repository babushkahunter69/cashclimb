import Link from 'next/link'
import NewsletterSignup from '@/components/NewsletterSignup'

const startLinks = [
  { href: '/blog', label: 'Browse guides' },
  { href: '/about', label: 'Why CashClimb exists' },
  { href: '/authors', label: 'Meet the authors' },
  { href: '/editorial-standards', label: 'Editorial standards' },
  { href: '/tools', label: 'Free tools' },
]

const popularLinks = [
  { href: '/blog?category=Personal%20Finance', label: 'Personal finance' },
  { href: '/blog?category=Investing', label: 'Investing' },
  { href: '/blog?category=Credit', label: 'Credit' },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-bg-2">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <NewsletterSignup
          variant="footer"
          source="footer"
          title="Turn one visit into a better money habit"
          description="Get new practical guides, calculators, and plain-English financial explainers from CashClimb. No ads, no sponsored rankings, no paywall."
        />

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="mb-3 font-serif text-xl font-bold">
              Cash<span className="text-gold">Climb</span>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-[#9A9490]">
              Practical personal finance and investing education built to be clear,
              useful, and transparent about its limits.
            </p>
            <p className="mt-4 max-w-lg text-xs leading-relaxed text-[#6A6460]">
              Content is for informational and educational purposes only and does not
              constitute financial, investment, tax, or legal advice.
            </p>
          </div>

          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">
              Start here
            </div>
            <ul className="space-y-2">
              {startLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#9A9490] transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">
              Popular topics
            </div>
            <ul className="space-y-2">
              {popularLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#9A9490] transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-[#6A6460] md:flex-row">
          <span>© {new Date().getFullYear()} CashClimb. All rights reserved.</span>
          <Link href="/admin/login?from=%2Fadmin" className="hover:text-gold">
            Editor login
          </Link>
        </div>
      </div>
    </footer>
  )
}
