import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanText(value: unknown, maxLength: number) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = cleanText(body.email, 254).toLowerCase()
    const name = cleanText(body.name, 120) || null
    const source = cleanText(body.source, 80) || 'site'
    const pagePath = cleanText(body.page_path, 300) || '/'

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          name,
          source,
          page_path: pagePath,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Newsletter signup failed:', error)
      return NextResponse.json(
        { error: 'Newsletter signup is not ready yet. Please run the newsletter Supabase migration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'You are on the list.' })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Could not save your signup. Please try again.' }, { status: 500 })
  }
}
