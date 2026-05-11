import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { cleanupExternalLinks } from '@/lib/normalize-links'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, body')

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    let scanned = 0
    let updated = 0

    for (const post of posts || []) {
      scanned++

      const originalBody = String(post.body || '')
      const cleanedBody = await cleanupExternalLinks(originalBody, {
        validateExternal: true,
        removeInvalid: true,
        rehydratePlainSources: true,
      })

      if (cleanedBody !== originalBody) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ body: cleanedBody })
          .eq('id', post.id)

        if (!updateError) updated++
      }
    }

    return NextResponse.json({ success: true, scanned, updated })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Link cleanup failed' },
      { status: 500 }
    )
  }
}
