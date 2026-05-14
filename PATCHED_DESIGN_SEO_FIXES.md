# CashClimb design and SEO cleanup

Implemented fixes:

- Removed automatic brand suffixing from metadata titles.
- Added `cleanSeoTitle()` and `displayTitle()` to strip CashClimb suffixes, pipe delimiters, and em dash separators from post titles.
- Added local category visuals under `/public/images/blog/`.
- Replaced generated Pexels cover URLs with local category image paths.
- Added `localizeCoverUrl()` so existing Pexels rows render as local category visuals without breaking old data.
- Simplified the homepage hero and reduced boxed UI density.
- Changed the trust-strip from card boxes to an open, section-based presentation.
- Removed the extra hard-coded blog “Key takeaways” box before article content.
- Updated post cards to use cleaned titles and local image fallbacks.
- Added optional Supabase cleanup SQL at `supabase/seo-design-cleanup.sql`.

Validation:

- `npx tsc --noEmit` passed.
- `npm run build` could not complete in this offline container because Next tried to download the SWC binary from npm.
