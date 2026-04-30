import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const login = String(body.username || body.email || '').trim()
    const password = String(body.password || '')

    const adminLogin = String(
      process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || 'admin'
    ).trim()

    const adminPassword = String(process.env.ADMIN_PASSWORD || '')

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_PASSWORD is not configured' },
        { status: 500 }
      )
    }

    if (login !== adminLogin || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid login' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('cashclimb_admin', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set('admin_auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}