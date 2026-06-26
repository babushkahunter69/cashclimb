'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Articles' },
    { href: '/about', label: 'About' },
    { href: '/authors', label: 'Authors' },
    { href: '/tools', label: 'Tools' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <div
            className="flex h-8 w-8 items-center justify-center bg-gold text-sm font-black text-bg"
            style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}
          >
            C
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">
            Cash<span className="text-gold">Climb</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-5 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap text-sm font-medium tracking-wide transition-colors ${
                pathname === link.href ? 'text-gold' : 'text-[#9A9490] hover:text-gold'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <NewsletterSignup variant="nav" source="header" cta="Join" />
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-2xl leading-none text-[#F0EDE8] md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          type="button"
        >
          {open ? '×' : '☰'}
        </button>
      </div>

      {open && (
        <div className="border-b border-border bg-bg-2 px-5 py-4 md:hidden">
          <div className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  pathname === link.href ? 'bg-bg-3 text-gold' : 'text-[#C8C0B9] hover:bg-bg-3 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3">
              <NewsletterSignup
                variant="inline"
                source="mobile-header"
                title="Get new CashClimb guides"
                description="Useful money guides by email, without sponsored rankings."
                cta="Join free"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
