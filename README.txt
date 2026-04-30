Patch contents:

1. app/api/admin/posts/[postId]/fix-seo/route.ts
   - Fixes the real Missing post ID bug.
   - Your folder is [postId], but the route was reading params.id.

2. components/admin/SEOFixButton.tsx
   - Included for consistency.
   - Calls /api/admin/posts/{postId}/fix-seo.

3. app/blog/[slug]/page.tsx
   - Fixes article layout overflow / bad wrapping.
   - Uses minmax(0, 1fr), min-w-0, and safer title wrapping.

Copy these files into your project root and overwrite matching files.
Then run:
rm -rf .next
npm run build
npm run dev
