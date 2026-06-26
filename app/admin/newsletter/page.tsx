export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase-server'

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-'
}

export default async function NewsletterAdminPage() {
  const supabase = createAdminClient()
  const { data, error, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  const subscribers = data ?? []
  const activeCount = subscribers.filter((subscriber: any) => subscriber.status === 'active').length

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Admin</p>
        <h1 className="mt-2 font-serif text-4xl font-black text-[#F0EDE8]">Newsletter</h1>
        <p className="mt-2 text-[#9A9490]">
          Recent email signups from the header, footer, homepage, and article forms.
        </p>
      </div>

      {error ? (
        <section className="rounded-2xl border border-border bg-bg-2 p-5 text-sm text-[#9A9490]">
          <p className="font-semibold text-[#F0EDE8]">Newsletter data could not load.</p>
          <p className="mt-2">
            Run <code className="text-gold">supabase/migrations/005_newsletter_subscribers.sql</code> in Supabase first.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg-2 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6A6460]">Total signups</p>
          <div className="mt-3 text-3xl font-black text-[#F0EDE8]">{count ?? subscribers.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6A6460]">Active shown</p>
          <div className="mt-3 text-3xl font-black text-[#F0EDE8]">{activeCount}</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6A6460]">Sources</p>
          <div className="mt-3 text-3xl font-black text-[#F0EDE8]">
            {new Set(subscribers.map((subscriber: any) => subscriber.source)).size}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-bg-2">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Latest subscribers</p>
        </div>
        <div className="divide-y divide-border">
          {subscribers.map((subscriber: any) => (
            <div key={subscriber.id} className="grid gap-2 px-5 py-4 md:grid-cols-[minmax(0,1fr)_160px_160px_120px]">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#F0EDE8]">{subscriber.email}</p>
                <p className="mt-1 truncate text-xs text-[#6A6460]">{subscriber.name || 'No name provided'}</p>
              </div>
              <p className="text-sm text-[#9A9490]">{subscriber.source || '-'}</p>
              <p className="truncate text-sm text-[#9A9490]">{subscriber.page_path || '-'}</p>
              <p className="text-sm text-[#9A9490]">{formatDate(subscriber.created_at)}</p>
            </div>
          ))}
          {!subscribers.length ? (
            <div className="px-5 py-10 text-center text-[#9A9490]">
              No newsletter subscribers yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
