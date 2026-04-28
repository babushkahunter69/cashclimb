update posts
set author = case
  when lower(coalesce(category, '')) like '%side hustle%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%make money%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%income%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%personal finance%' then 'Daniel Reeves'
  when lower(coalesce(category, '')) like '%budget%' then 'Sophie Tran'
  when lower(coalesce(category, '')) like '%bank%' then 'Sophie Tran'
  when lower(coalesce(category, '')) like '%credit%' then 'Sophie Tran'
  else 'Daniel Reeves'
end
where author ilike '%editorial%' or author is null;
