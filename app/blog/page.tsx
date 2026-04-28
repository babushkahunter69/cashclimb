export const dynamic = "force-dynamic"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase-server"
import { getAuthorByName } from "@/lib/authors"

async function getPosts() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })

  return data || []
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-10">Articles</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            // ✅ FIXED AUTHOR LOGIC
            const author = post.author
              ? getAuthorByName(post.author)
              : null

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="border border-gray-800 rounded-lg p-5 hover:border-yellow-500 transition"
              >
                <h2 className="font-semibold text-lg mb-2">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-400 mb-3">
                  {post.excerpt}
                </p>

                <div className="text-sm text-gray-500">
                  {author ? author.name : "CashClimb Editorial"}
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <Footer />
    </>
  )
}