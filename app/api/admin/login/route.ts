import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const login =
      body.username ||
      body.email ||
      body.login ||
      ''

    const password = body.password || ''

    const adminLogin =
      process.env.ADMIN_EMAIL ||
      process.env.ADMIN_USERNAME ||
      'admin'

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured' },
        { status: 500 }
      )
    }

    const loginMatches = String(login).trim() === String(adminLogin).trim()
    const passwordMatches = String(password) === String(adminPassword)

    if (!loginMatches || !passwordMatches) {
      return NextResponse.json({ error: 'Invalid login' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('cashclimb_admin', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Login failed' },
      { status: 500 }
    )
  }
}