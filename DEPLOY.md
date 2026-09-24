# Production deployment

## GitHub Pages

1. GitHub repository settings -> **Secrets and variables -> Actions** bölümünde iki repository secret oluştur:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Settings -> Pages -> Source olarak **GitHub Actions** seç.
3. `main` branch'ine push yap. Workflow tamamlanınca site şu adreste açılır:
   `https://melihokan3-lgtm.github.io/e-stor-react/`

`public/_redirects` dosyası SPA route'ları için eklenmiştir. GitHub Pages'te doğrudan alt route yenilemeleri için hosting tarafında fallback gerekir; en sorunsuz seçenek Cloudflare Pages'tir. Cloudflare Pages'te repository'yi bağlayıp build command `npm run build`, output directory `dist` seçilmelidir.

## Supabase Storage

`supabase/storage.sql` dosyasını Supabase SQL Editor'da bir kez çalıştır. Daha sonra Storage -> `product-images` bucket'ına `public/img` içindeki görselleri yükle. Ürün tablosundaki `image` alanlarını bucket public URL'leriyle güncelle:

`https://xblmgefooqnapaqanfkc.supabase.co/storage/v1/object/public/product-images/milk1.png`

Frontend'e `service_role` veya `secret` key koyma.

## Existing Supabase projects

For an already-created Supabase project, run `supabase/security-hardening.sql`
in SQL Editor once. New orders then use the `create_order` RPC, which calculates
prices from `public.products`; direct browser inserts and total changes are
blocked by database privileges. Products from the supplemental demo APIs must
be seeded into `public.products` before they can be ordered.

## Account deletion

The profile's **Hesabı sil** action requires the `delete-account` Supabase Edge
Function. Deploy it to the same Supabase project used by `VITE_SUPABASE_URL`:

```sh
npx supabase login
npx supabase link --project-ref xblmgefooqnapaqanfkc
npx supabase functions deploy delete-account
```

Keep JWT verification enabled (do not pass `--no-verify-jwt`). The function
validates the signed-in user and uses the server-side admin client; no admin
key belongs in the Vite frontend or GitHub repository.

Before enabling deletion on an existing database, run this **read-only** check
in Supabase SQL Editor:

```sql
select conrelid::regclass as table_name, conname, confdeltype
from pg_constraint
where contype = 'f' and confrelid = 'auth.users'::regclass
order by 1;
```

The `profiles`, `addresses`, `carts`, and `orders` references must show `c`
(`ON DELETE CASCADE`), as in `supabase/schema.sql`. Audit any additional
user-owned tables and Storage objects in the live project too; an Auth user
who owns Storage objects cannot be deleted until those objects are removed.
Test the end-to-end flow with a disposable account only, never a real user.
