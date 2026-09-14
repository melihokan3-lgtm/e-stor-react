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
