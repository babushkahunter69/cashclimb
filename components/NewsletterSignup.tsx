'use client'

import { FormEvent, useState } from 'react'
import { usePathname } from 'next/navigation'

type NewsletterSignupProps = {
  variant?: 'nav' | 'card' | 'footer' | 'inline'
  source?: string
  title?: string
  description?: string
  cta?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NewsletterSignup({
  variant = 'card',
  source,
  title = 'Get better money decisions in your inbox',
  description = 'A short, practical email with clear financial guides, useful tools, and new CashClimb articles. No spam, no sponsored rankings.',
  cta = 'Join free',
}: NewsletterSignupProps) {
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!emailPattern.test(trimmedEmail)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          name: trimmedName || null,
          source: source || variant,
          page_path: pathname || '/',
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result?.error || 'Signup failed')
      }

      setStatus('success')
      setMessage(result?.message || 'You are on the list.')
      setEmail('')
      setName('')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not save your signup. Please try again.'
      )
    }
  }

  if (variant === 'nav') {
    return (
      <form onSubmit={onSubmit} className="hidden items-center gap-2 lg:flex" aria-label="Newsletter signup">
        <label htmlFor="nav-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="nav-newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email for new guides"
          className="h-9 w-48 rounded-lg border border-border bg-[#111214] px-3 text-xs text-[#F0EDE8] placeholder:text-[#6A6460] focus:border-gold"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          className="h-9 rounded-lg border border-gold bg-gold px-3 text-[10px] font-black uppercase tracking-widest text-bg transition-opacity hover:opacity-90 disabled:opacity-70"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Joining' : cta}
        </button>
        <span className="sr-only" aria-live="polite">{message}</span>
      </form>
    )
  }

  const compact = variant === 'inline'

  return (
    <section
      id={variant === 'footer' ? 'newsletter' : undefined}
      className={
        variant === 'footer'
          ? 'rounded-3xl border border-gold/25 bg-[rgba(212,175,55,0.05)] p-6'
          : compact
            ? 'rounded-2xl border border-border bg-bg-2 p-5'
            : 'rounded-3xl border border-gold/25 bg-[rgba(212,175,55,0.05)] p-6 md:p-8'
      }
    >
      <div className={variant === 'footer' ? 'max-w-xl' : 'max-w-2xl'}>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
          Newsletter
        </p>
        <h2 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-serif font-black text-[#F0EDE8]`}>
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#B7B0AA]">
          {description}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)_auto]" aria-label="Newsletter signup">
        <label className="sr-only" htmlFor={`${variant}-newsletter-name`}>
          Name
        </label>
        <input
          id={`${variant}-newsletter-name`}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name (optional)"
          className="cc-input min-h-[44px]"
          disabled={status === 'loading'}
        />

        <label className="sr-only" htmlFor={`${variant}-newsletter-email`}>
          Email address
        </label>
        <input
          id={`${variant}-newsletter-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="cc-input min-h-[44px]"
          disabled={status === 'loading'}
          required
        />

        <button type="submit" className="cc-btn-primary min-h-[44px]" disabled={status === 'loading'}>
          {status === 'loading' ? 'Joining...' : cta}
        </button>
      </form>

      <p
        className={`mt-3 text-sm ${status === 'error' ? 'text-[#F08A8A]' : 'text-[#9A9490]'}`}
        aria-live="polite"
      >
        {message || 'Educational emails only. Unsubscribe anytime.'}
      </p>
    </section>
  )
}
