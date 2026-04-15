import { NextRequest, NextResponse } from 'next/server'

export function requireAdmin(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (!process.env.ADMIN_PASSWORD || adminKey !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
