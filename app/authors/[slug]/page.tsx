export const dynamic = "force-dynamic"
export const revalidate = 0

import { notFound } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { createAdminClient } from "@/lib/supabase-server"
import { getAuthorByName } from "@/lib/authors"

async function getPost(slug: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  return data
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) return notFound()

  // ✅ FIXED AUTHOR LOGIC (NO FAKE FALLBACK)
  const author = post.author
    ? getAuthorByName(post.author)
    : null

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="text-gray-400 mb-6">
          {author ? author.name : "CashClimb Editorial"}
        </div>

        <article
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </main>

      <Footer />
    </>
  )
}