export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createAdminClient } from '@/lib/supabase-server'
import { getAuthorByName, resolvePostAuthorName } from '@/lib/authors'
import { getAutoAuthor } from '@/lib/seo-authors'
import { normalizeLinksInHtml } from '@/lib/normalize-links'
import type { Post } from '@/types'

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://cashclimb.org').replace(/\/$/, '')

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function stripHtml(value?: string | null) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function getPost(slug: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  return data as Post | null
}

async function getRelatedPosts(post: Post) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('category', post.category)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (data ?? []) as Post[]
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) return {}

  const url = `${siteUrl}/blog/${post.slug}`
  const image = post.cover_url || `${siteUrl}/opengraph-image`
  const description = (post as any).seo_description || post.excerpt
  const title = (post as any).seo_title || post.title

  return {
    title: `${title} | CashClimb`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [{ url: image }],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  if (!post) notFound()

  const fallbackAuthor = getAutoAuthor('cashclimb', post.category)
  const authorName = resolvePostAuthorName(post)
  const author = getAuthorByName(authorName)
  const relatedPosts = await getRelatedPosts(post)
  const articleUrl = `${siteUrl}/blog/${post.slug}`
  const image = post.cover_url || `${siteUrl}/opengraph-image`
  const cleanBody = normalizeLinksInHtml(post.body || '')
  const plainBody = stripHtml(cleanBody)
  const updatedDate = post.updated_at || post.created_at

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'CashClimb',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/opengraph-image`,
        },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/authors/${author.slug}#author`,
        name: author.name,
        url: `${siteUrl}/authors/${author.slug}`,
        jobTitle: author.role,
        description: author.intro,
        knowsAbout: author.topics,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Articles',
            item: `${siteUrl}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: articleUrl,
          },
        ],
      },
      {
        '@type': 'Article',
        '@id': `${articleUrl}#article`,
        mainEntityOfPage: articleUrl,
        headline: post.title,
        description: post.excerpt,
        image,
        articleSection: post.category,
        wordCount: plainBody ? plainBody.split(/\s+/).length : undefined,
        datePublished: post.created_at,
        dateModified: updatedDate,
        author: {
          '@id': `${siteUrl}/authors/${author.slug}#author`,
        },
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${articleUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is ${post.title} financial advice?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. CashClimb content is for informational and educational purposes only and should not be treated as personal financial advice.',
            },
          },
          {
            '@type': 'Question',
            name: 'Who reviews CashClimb content?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CashClimb articles are reviewed for clarity, usefulness, and responsible financial education.',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />

      <main className="mx-auto max-w-7xl overflow-hidden px-6 py-12">
        <article className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 max-w-full overflow-hidden">
            <div className="mb-8">
              <Link
                href="/blog"
                className="text-sm font-semibold text-gold hover:opacity-80"
              >
                ← Back to articles
              </Link>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#9A9490]">
                <span className="text-gold">{post.category}</span>
                <span>{formatDate(updatedDate)}</span>
                <span>{post.read_time}</span>
              </div>

              <h1 className="mt-4 max-w-4xl break-words font-serif text-4xl font-black leading-tight text-[#F0EDE8] md:text-5xl">
                {post.title}
              </h1>

              <p className="mt-5 max-w-4xl text-lg leading-relaxed text-[#B7B0AA]">
                {post.excerpt}
              </p>
            </div>

            <Link
              href={`/authors/${author.slug}`}
              rel="author"
              className="mb-8 block rounded-2xl border border-border bg-bg-2 p-5 transition-colors hover:border-gold"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-[#111214] text-center text-base font-black leading-none tracking-normal text-[#F0EDE8]">
                  {author.initials}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">
                    Written by
                  </p>
                  <p className="mt-1 text-sm text-[#9A9490]">
                    By <span className="font-bold text-[#F0EDE8]">{author.name}</span>
                  </p>
                  <p className="mt-1 text-sm text-[#9A9490]">{author.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#B7B0AA]">
                    {author.intro}
                  </p>
                </div>
              </div>
            </Link>

            {post.cover_url ? (
              <div className="relative mb-10 aspect-[16/8] overflow-hidden rounded-3xl border border-border">
                <Image
                  src={post.cover_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}

            <section className="mb-8 rounded-2xl border border-border bg-bg-2 p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                Key takeaways
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-[#D7D0CA]">
                <li>Use this guide as educational information, not personal financial advice.</li>
                <li>Compare options carefully before making money decisions.</li>
                <li>Focus on practical actions that match your income, goals, and risk level.</li>
              </ul>
            </section>

            <div
              className="prose-cashclimb max-w-none overflow-hidden break-words"
              dangerouslySetInnerHTML={{ __html: cleanBody }}
            />

            <section className="mt-10 rounded-2xl border border-border bg-bg-2 p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                Financial disclaimer
              </h2>
              <p className="text-sm leading-relaxed text-[#B7B0AA]">
                This content is for informational and educational purposes only.
                It does not constitute financial, investment, tax, or legal advice.
                Always consider your personal situation and consult a qualified professional
                before making financial decisions.
              </p>
            </section>

            <section className="mt-10 rounded-2xl border border-border bg-bg-2 p-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                Reviewed by
              </h2>
              <p className="font-bold text-[#F0EDE8]">{fallbackAuthor.reviewerName}</p>
              <p className="text-sm text-[#9A9490]">{fallbackAuthor.reviewerRole}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#B7B0AA]">
                {fallbackAuthor.reviewerBio}
              </p>
            </section>

            <section className="mt-10 rounded-2xl border border-border bg-bg-2 p-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                About the author
              </h2>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-[#111214] text-center text-base font-black leading-none tracking-normal text-[#F0EDE8]">
                  {author.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#F0EDE8]">{author.name}</p>
                  <p className="text-sm text-[#9A9490]">{author.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#B7B0AA]">
                    {author.bio.join(' ')}
                  </p>
                  <Link
                    href={`/authors/${author.slug}`}
                    rel="author"
                    className="mt-4 inline-flex text-sm font-semibold text-gold hover:opacity-80"
                  >
                    View author profile →
                  </Link>
                </div>
              </div>
            </section>

            {relatedPosts.length > 0 ? (
              <section className="mt-12">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">
                  Related guides
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {relatedPosts.map((item) => {
                    const relatedAuthorName = resolvePostAuthorName(item)
                    const relatedAuthor = getAuthorByName(relatedAuthorName)

                    return (
                      <Link
                        key={item.id}
                        href={`/blog/${item.slug}`}
                        className="rounded-2xl border border-border bg-bg-2 p-5 transition-colors hover:border-gold"
                      >
                        <p className="mb-2 text-xs font-bold text-gold">
                          {item.category}
                        </p>
                        <h3 className="break-words font-bold leading-snug text-[#F0EDE8]">
                          {item.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm text-[#9A9490]">
                          {item.excerpt}
                        </p>
                        <p className="mt-4 text-xs text-[#6A6460]">
                          By {relatedAuthor.name}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-5 lg:block">
            <div className="rounded-2xl border border-border bg-bg-2 p-5 lg:sticky lg:top-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                Article details
              </p>
              <div className="space-y-3 text-sm text-[#B7B0AA]">
                <p>
                  <strong className="text-[#F0EDE8]">Category:</strong> {post.category}
                </p>
                <p>
                  <strong className="text-[#F0EDE8]">Updated:</strong>{' '}
                  {formatDate(updatedDate)}
                </p>
                <p>
                  <strong className="text-[#F0EDE8]">Read time:</strong> {post.read_time}
                </p>
                <p>
                  <strong className="text-[#F0EDE8]">Author:</strong>{' '}
                  <Link href={`/authors/${author.slug}`} rel="author" className="text-gold hover:opacity-80">
                    {author.name}
                  </Link>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-2 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                Reviewed by
              </p>
              <p className="text-sm leading-relaxed text-[#B7B0AA]">
                <strong className="text-[#F0EDE8]">{fallbackAuthor.reviewerName}</strong> — {fallbackAuthor.reviewerBio}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-2 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
                Editorial standard
              </p>
              <p className="text-sm leading-relaxed text-[#B7B0AA]">
                CashClimb aims to publish clear, useful, beginner-friendly financial
                education with responsible disclaimers and practical examples.
              </p>
            </div>
          </aside>
        </article>
      </main>

      <Footer />
    </>
  )
}
