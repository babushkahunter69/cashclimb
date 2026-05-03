'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function fromPathname(pathname?: string | null) {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '')
  const parts = path.split('/').filter(Boolean)
  const postsIndex = parts.indexOf('posts')

  if (postsIndex === -1) return ''
  return parts[postsIndex + 1] || ''
}

function fromParams(params: Record<string, string | string[]>) {
  const candidates = [params.postId, params.id]

  for (const value of candidates) {
    if (Array.isArray(value)) return value[0] || ''
    if (typeof value === 'string') return value
  }

  return ''
}

export default function SEOFixButton({ postId }: { postId?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<Record<string, string | string[]>>()

  async function handleClick() {
    const resolvedPostId = postId || fromParams(params) || fromPathname(pathname)

    if (!resolvedPostId) {
      toast.error(`Missing post ID from ${pathname || 'current page'}`)
      return
    }

    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(resolvedPostId)}/fix-seo`, {
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
      }, 400)
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
