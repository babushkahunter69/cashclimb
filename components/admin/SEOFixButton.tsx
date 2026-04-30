'use client'

import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function extractPostId(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  const postsIndex = parts.indexOf('posts')

  if (postsIndex === -1) return ''
  return parts[postsIndex + 1] || ''
}

export default function SEOFixButton({ postId }: { postId?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleClick() {
    const resolvedPostId = postId || extractPostId(pathname)

    console.log('[SEOFixButton]', {
      postId,
      pathname,
      resolvedPostId,
    })

    if (!resolvedPostId) {
      toast.error(`Missing post ID from ${pathname}`)
      return
    }

    try {
      const res = await fetch(`/api/admin/posts/${resolvedPostId}/fix-seo`, {
        method: 'POST',
        cache: 'no-store',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Fix SEO failed')
        return
      }

      toast.success(`Fixed SEO. Score: ${data.score ?? 'updated'}`)

      router.refresh()

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error('[SEOFixButton]', err)
      toast.error('Request failed')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-xl bg-gold px-4 py-4 text-xs font-black uppercase tracking-[0.18em] text-bg transition hover:bg-gold-light"
    >
      Fix SEO Issues
    </button>
  )
}