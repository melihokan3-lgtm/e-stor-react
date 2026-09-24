-- Apply in the Supabase SQL Editor for the existing production project.
-- A browser must not create an order before a trusted payment webhook confirms it.
revoke insert on table public.orders from anon, authenticated;
revoke execute on function public.create_order(text, jsonb, numeric, text) from public, anon, authenticated;
