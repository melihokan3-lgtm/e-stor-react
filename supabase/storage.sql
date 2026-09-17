-- Run once in Supabase SQL Editor after creating the `product-images` bucket.
-- The bucket is public so product image URLs work on the deployed storefront.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- Product images are deployment assets. Client-side users must not be able to
-- upload or overwrite files in this shared public bucket.
drop policy if exists "product_images_authenticated_upload" on storage.objects;
drop policy if exists "product_images_authenticated_update" on storage.objects;
