-- Optional one-time cleanup for existing published posts.
-- The app now protects rendering and metadata even if old rows still contain these values.

update posts
set seo_title = trim(regexp_replace(regexp_replace(coalesce(seo_title, title), '\\s*(\\||—|–|-|:)\\s*CashClimb(\\s+Guide)?\\s*$', '', 'gi'), '\\s*(\\||—|–)\\s*', ': ', 'g'))
where seo_title is not null;

update posts
set title = trim(regexp_replace(regexp_replace(title, '\\s*(\\||—|–|-|:)\\s*CashClimb(\\s+Guide)?\\s*$', '', 'gi'), '\\s*(\\||—|–)\\s*', ': ', 'g'))
where title ~* '(\\||—|–|-|:)\\s*CashClimb';

update posts
set cover_url = case category
  when 'Investing' then '/images/blog/investing.svg'
  when 'Credit' then '/images/blog/credit.svg'
  when 'Retirement' then '/images/blog/retirement.svg'
  when 'Taxes' then '/images/blog/taxes.svg'
  when 'Real Estate' then '/images/blog/real-estate.svg'
  else '/images/blog/personal-finance.svg'
end
where cover_url ~* '^https?://(images\\.)?pexels\\.com/';
