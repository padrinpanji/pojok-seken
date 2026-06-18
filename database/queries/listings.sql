select
  listings.id,
  listings.slug,
  listings.title,
  categories.name as category_name,
  listing_conditions.name as condition_name,
  sellers.store_name as seller_name,
  listings.price,
  listings.location,
  listings.production_year,
  listings.description
from public.listings
join public.categories on categories.id = listings.category_id
join public.sellers on sellers.id = listings.seller_id
join public.listing_conditions on listing_conditions.id = listings.condition_id
where listings.is_active = true
order by listings.id asc;

select *
from public.products
order by id asc;

select
  sellers.slug,
  sellers.store_name,
  sellers.location,
  count(listings.id) as active_listing_count
from public.sellers
left join public.listings on listings.seller_id = sellers.id and listings.is_active = true
group by sellers.id
order by sellers.store_name asc;

select
  '/products/' || slug as sitemap_path,
  updated_at as last_modified
from public.listings
where is_active = true
order by id asc;
