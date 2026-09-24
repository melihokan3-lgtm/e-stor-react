-- Run this once in Supabase SQL Editor for an existing project.
-- It closes direct client-side order creation and forces price calculation
-- against the public.products table inside a server-side database function.

alter table public.orders enable row level security;

drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own" on public.orders
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke insert on public.orders from anon, authenticated;
revoke update on public.orders from anon, authenticated;
grant update (delivery_address) on public.orders to authenticated;

create or replace function public.create_order(
  p_delivery_address text,
  p_items jsonb,
  p_tip numeric default 0,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  item jsonb;
  item_id bigint;
  item_qty integer;
  product_row record;
  canonical_items jsonb := '[]'::jsonb;
  subtotal numeric(10, 2) := 0;
  delivery_fee numeric(10, 2) := 4.78;
  normalized_coupon text := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
  coupon_discount numeric(10, 2) := 0;
  calculated_total numeric(10, 2);
  inserted_order public.orders;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if p_delivery_address is null or length(trim(p_delivery_address)) = 0 or length(p_delivery_address) > 500 then
    raise exception 'Invalid delivery address';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'Invalid order items';
  end if;
  if p_tip is null or p_tip < 0 or p_tip > 100 then raise exception 'Invalid tip'; end if;

  for item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(item) <> 'object'
      or not (item ? 'id') or not (item->>'id' ~ '^[0-9]+$')
      or not (item ? 'qty') or not (item->>'qty' ~ '^[0-9]+$') then
      raise exception 'Invalid order item';
    end if;
    item_id := (item->>'id')::bigint;
    item_qty := (item->>'qty')::integer;
    if item_id < 1 or item_qty < 1 or item_qty > 100 then raise exception 'Invalid order item quantity'; end if;
    select id, title, price, category, image into product_row from public.products where id = item_id;
    if not found then raise exception 'Product is not available'; end if;
    subtotal := subtotal + (product_row.price * item_qty);
    canonical_items := canonical_items || jsonb_build_array(jsonb_build_object(
      'id', product_row.id, 'title', product_row.title, 'img', product_row.image,
      'price', product_row.price, 'qty', item_qty, 'category', product_row.category
    ));
  end loop;

  if normalized_coupon = 'HOSGELDIN20' and subtotal >= 100 then coupon_discount := round(subtotal * 0.20, 2);
  elsif normalized_coupon = 'KARGOBEDAVA' and subtotal >= 200 then coupon_discount := delivery_fee;
  elsif normalized_coupon = 'YAZ2026' and subtotal >= 75 then coupon_discount := round(subtotal * 0.15, 2);
  elsif normalized_coupon = 'OZEL50' and subtotal >= 250 then coupon_discount := 50;
  end if;

  calculated_total := greatest(0, round(subtotal + delivery_fee + p_tip - coupon_discount, 2));
  insert into public.orders (user_id, status, total, delivery_address, items)
  values (current_user_id, 'Processing', calculated_total, trim(p_delivery_address), canonical_items)
  returning * into inserted_order;

  return jsonb_build_object(
    'id', inserted_order.id, 'status', inserted_order.status, 'total', inserted_order.total,
    'delivery_address', inserted_order.delivery_address, 'items', inserted_order.items,
    'created_at', inserted_order.created_at
  );
end;
$$;

revoke all on function public.create_order(text, jsonb, numeric, text) from public, anon;
-- Keep checkout closed until a trusted payment webhook confirms the charge.
revoke execute on function public.create_order(text, jsonb, numeric, text) from authenticated;
