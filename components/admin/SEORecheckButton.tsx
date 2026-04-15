'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function getAdminKey() {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('cc-admin-key') ?? ''
}

export default function SEORecheckButton({ postId }: { postId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const adminKey = getAdminKey()
    if (!adminKey) {
      toast.error('Session expired. Please log in again.')
      window.location.href = '/admin/login'
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quality-checks/${postId}`, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || 'Failed to run SEO checklist.')
      toast.success(`Checklist refreshed. Score: ${payload?.evaluation?.score ?? '—'}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to run SEO checklist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className="cc-btn-primary w-full disabled:opacity-60">
      {loading ? 'Re-running…' : 'Re-run SEO checklist'}
    </button>
  )
}
