insert into public.categories (slug, name)
values
  ('electronics', 'Elektronik'),
  ('camera', 'Kamera'),
  ('furniture', 'Furnitur'),
  ('fashion', 'Fashion'),
  ('hobby', 'Hobi'),
  ('vehicle', 'Kendaraan')
on conflict (slug) do update set name = excluded.name;

insert into public.listing_conditions (slug, name)
values
  ('used-like-new', 'Bekas Like New'),
  ('used-well-kept', 'Bekas Terawat'),
  ('used-good', 'Bekas Bagus'),
  ('used-ready', 'Bekas Siap Pakai'),
  ('used-smooth', 'Bekas Mulus')
on conflict (slug) do update set name = excluded.name;

insert into public.sellers (slug, store_name, location, phone)
values
  ('raka-gadget', 'Raka Gadget', 'Jakarta Selatan', '+628123456789'),
  ('nara-kamera', 'Nara Kamera', 'Bandung', '+628123456789'),
  ('rumah-rapi', 'Rumah Rapi', 'Tangerang', '+628123456789'),
  ('gowes-corner', 'Gowes Corner', 'Depok', '+628123456789'),
  ('office-seken', 'Office Seken', 'Bekasi', '+628123456789'),
  ('biru-phone', 'Biru Phone', 'Jakarta Barat', '+628123456789')
on conflict (slug) do update
set
  store_name = excluded.store_name,
  location = excluded.location,
  phone = excluded.phone;

insert into public.listings (
  id,
  slug,
  title,
  category_id,
  seller_id,
  condition_id,
  price,
  location,
  production_year,
  description
)
values
  (
    1,
    'macbook-air-m1-2020-mulus',
    'MacBook Air M1 2020 Mulus',
    (select id from public.categories where slug = 'electronics'),
    (select id from public.sellers where slug = 'raka-gadget'),
    (select id from public.listing_conditions where slug = 'used-like-new'),
    9200000,
    'Jakarta Selatan',
    '2020',
    'MacBook Air M1 RAM 8GB SSD 256GB, baterai sehat, bodi mulus, siap pakai untuk kerja harian, kuliah, dan editing ringan.'
  ),
  (
    2,
    'sony-a6400-kit-lens-16-50mm',
    'Sony A6400 Kit Lens 16-50mm',
    (select id from public.categories where slug = 'camera'),
    (select id from public.sellers where slug = 'nara-kamera'),
    (select id from public.listing_conditions where slug = 'used-well-kept'),
    10800000,
    'Bandung',
    '2019',
    'Kamera mirrorless Sony A6400 lengkap dengan kit lens, cocok untuk konten, travel, dan foto produk. Sensor bersih dan autofocus normal.'
  ),
  (
    3,
    'sofa-minimalis-abu-3-seater',
    'Sofa Minimalis Abu 3 Seater',
    (select id from public.categories where slug = 'furniture'),
    (select id from public.sellers where slug = 'rumah-rapi'),
    (select id from public.listing_conditions where slug = 'used-good'),
    1850000,
    'Tangerang',
    '2023',
    'Sofa kain abu ukuran 3 seater, busa masih empuk, rangka kokoh, cocok untuk ruang tamu apartemen atau rumah minimalis.'
  ),
  (
    4,
    'sepeda-lipat-20-inch-urban',
    'Sepeda Lipat 20 Inch Urban',
    (select id from public.categories where slug = 'hobby'),
    (select id from public.sellers where slug = 'gowes-corner'),
    (select id from public.listing_conditions where slug = 'used-ready'),
    2100000,
    'Depok',
    '2022',
    'Sepeda lipat 20 inch untuk komuter kota, ringan, rem pakem, gear normal, dan mudah masuk bagasi mobil.'
  ),
  (
    5,
    'kursi-kerja-ergonomis-hitam',
    'Kursi Kerja Ergonomis Hitam',
    (select id from public.categories where slug = 'furniture'),
    (select id from public.sellers where slug = 'office-seken'),
    (select id from public.listing_conditions where slug = 'used-well-kept'),
    975000,
    'Bekasi',
    '2021',
    'Kursi kerja ergonomis dengan sandaran mesh, armrest, dan hidrolik normal. Nyaman untuk WFH panjang.'
  ),
  (
    6,
    'iphone-13-128gb-midnight',
    'iPhone 13 128GB Midnight',
    (select id from public.categories where slug = 'electronics'),
    (select id from public.sellers where slug = 'biru-phone'),
    (select id from public.listing_conditions where slug = 'used-smooth'),
    7600000,
    'Jakarta Barat',
    '2021',
    'iPhone 13 128GB warna Midnight, Face ID normal, kamera jernih, iCloud aman, cocok untuk upgrade harian.'
  )
on conflict (slug) do update
set
  title = excluded.title,
  category_id = excluded.category_id,
  seller_id = excluded.seller_id,
  condition_id = excluded.condition_id,
  price = excluded.price,
  location = excluded.location,
  production_year = excluded.production_year,
  description = excluded.description,
  updated_at = now();

insert into public.listing_images (listing_id, url, display_order, is_primary)
values
  (1, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', 1, true),
  (1, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80', 2, false),
  (2, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80', 1, true),
  (2, 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1200&q=80', 2, false),
  (3, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', 1, true),
  (3, 'https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?auto=format&fit=crop&w=1200&q=80', 2, false),
  (4, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80', 1, true),
  (4, 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80', 2, false),
  (5, 'https://images.unsplash.com/photo-1505843490701-5be5d8b5a1f1?auto=format&fit=crop&w=1200&q=80', 1, true),
  (5, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80', 2, false),
  (6, 'https://images.unsplash.com/photo-1632633173522-45589163466f?auto=format&fit=crop&w=1200&q=80', 1, true),
  (6, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', 2, false)
on conflict do nothing;

insert into public.listing_highlights (listing_id, value, display_order)
values
  (1, 'RAM 8GB', 1), (1, 'SSD 256GB', 2), (1, 'Baterai sehat', 3), (1, 'Fullset charger', 4),
  (2, 'Shutter rendah', 1), (2, 'Kit lens', 2), (2, 'Tas kamera', 3), (2, 'Baterai cadangan', 4),
  (3, '3 seater', 1), (3, 'Busa empuk', 2), (3, 'Rangka kuat', 3), (3, 'Siap angkut', 4),
  (4, '20 inch', 1), (4, 'Frame ringan', 2), (4, 'Rem normal', 3), (4, 'Ban tebal', 4),
  (5, 'Mesh back', 1), (5, 'Hidrolik normal', 2), (5, 'Armrest', 3), (5, 'Roda lancar', 4),
  (6, '128GB', 1), (6, 'Face ID normal', 2), (6, 'Kamera jernih', 3), (6, 'iCloud aman', 4)
on conflict do nothing;

select setval(pg_get_serial_sequence('public.listings', 'id'), coalesce((select max(id) from public.listings), 1));
