import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import { createAdminClient } from '@/lib/supabase-server'
import { AUTHORS, getAuthorBySlug } from '@/lib/authors'
import type { Post } from '@/types'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return AUTHORS.map((author) => ({
    slug: author.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = getAuthorBySlug(params.slug)

  if (!author) {
    return {
      title: 'Author not found | CashClimb',
    }
  }

  return {
    title:
      author.name === 'CashClimb Editorial'
        ? `${author.name} | CashClimb`
        : `${author.name} | CashClimb Author`,
    description: author.intro,
    alternates: {
      canonical: `https://cashclimb.com/authors/${author.slug}`,
    },
    openGraph: {
      title: author.name,
      description: author.tagline,
      url: `https://cashclimb.com/authors/${author.slug}`,
      type: 'profile',
    },
  }
}

export default async function AuthorPage({ params }: Props) {
  const author = getAuthorBySlug(params.slug)
  if (!author) notFound()

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('author', author.name)
    .order('created_at', { ascending: false })

  const posts: Post[] = data ?? []

  const schema =
    author.schemaType === 'Organization'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: author.name,
          url: `https://cashclimb.com/authors/${author.slug}`,
          description: author.intro,
          parentOrganization: {
            '@type': 'Organization',
            name: 'CashClimb',
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: author.name,
          url: `https://cashclimb.com/authors/${author.slug}`,
          jobTitle: author.role,
          worksFor: {
            '@type': 'Organization',
            name: 'CashClimb',
          },
          description: author.intro,
        }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <Link
          href="/blog"
          className="text-[#9A9490] text-sm hover:text-gold transition-colors inline-flex items-center gap-2 mb-8"
        >
          ← Back to Articles
        </Link>

        <section className="bg-bg-2 border border-border rounded-3xl p-8 mb-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            <div className="w-20 h-20 rounded-full border border-border bg-[#111214] text-[#F0EDE8] flex items-center justify-center text-xl font-bold tracking-wide flex-shrink-0">
              {author.initials}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold tracking-wide uppercase text-gold mb-2">
                {author.role}
              </p>

              <h1 className="font-serif text-4xl lg:text-5xl font-black leading-[1.1] mb-3">
                {author.name}
              </h1>

              <p className="text-[#F0EDE8] text-lg mb-3">{author.tagline}</p>
              <p className="text-[#9A9490] leading-relaxed max-w-3xl">
                {author.intro}
              </p>

              <div className="flex flex-wrap gap-2 mt-5">
                {author.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full px-3 py-1 text-xs font-bold tracking-wide border border-border text-[#9A9490]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-8 mb-12">
          <div className="bg-bg-2 border border-border rounded-3xl p-8">
            <h2 className="font-serif text-2xl font-bold mb-5 text-[#F0EDE8]">
              About
            </h2>

            <div className="space-y-4 text-[#9A9490] leading-relaxed">
              {author.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="bg-bg-2 border border-border rounded-3xl p-8">
            <h2 className="font-serif text-xl font-bold mb-3 text-[#F0EDE8]">
              Editorial approach
            </h2>

            <p className="text-sm text-[#9A9490] leading-relaxed mb-4">
              CashClimb publishes practical, reader-first financial content guided by
              our editorial standards.
            </p>

            <Link
              href="/editorial-standards"
              className="text-sm font-semibold text-gold hover:opacity-80 transition-opacity"
            >
              Read our Editorial Standards
            </Link>
          </aside>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#F0EDE8]">
                Articles by {author.name}
              </h2>
              <p className="text-[#6A6460] text-sm mt-2">
                {posts.length} article{posts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-bg-2 border border-border rounded-3xl">
              <p className="font-serif text-2xl text-[#F0EDE8] mb-2">
                Articles coming soon
              </p>
              <p className="text-[#9A9490] text-sm mb-5">
                We’re publishing more articles from this author soon. In the meantime,
                explore the latest guides on the blog.
              </p>
              <Link
                href="/blog"
                className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-bg"
              >
                Browse all articles
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}