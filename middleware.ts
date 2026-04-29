import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'cc-admin-token'

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  const publicPaths = [
    '/admin/login',
    '/api/auth/login',
    '/api/auth/logout',
  ]

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || token !== adminPassword) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}