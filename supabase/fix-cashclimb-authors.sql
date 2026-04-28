-- Run this once in Supabase SQL Editor if any old posts still store CashClimb Editorial.
update posts
set author = case
  when lower(coalesce(category, '')) like '%side hustle%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%make money%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%income%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%personal finance%' then 'Daniel Reeves'
  else 'Sophie Tran'
end
where author ilike '%editorial%';

select title, category, author
from posts
where author ilike '%editorial%'
order by updated_at desc nulls last, created_at desc;
