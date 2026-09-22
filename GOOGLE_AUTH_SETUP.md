# Google ile giriş kurulumu

Uygulamadaki Google butonu Supabase Auth OAuth akışını kullanır. Google client secret frontend'e eklenmez; yalnızca Supabase Dashboard'a girilir.

## 1. Google Cloud Console

1. Google Cloud Console'da proje seçin veya yeni proje oluşturun.
2. `APIs & Services > OAuth consent screen` bölümünde OAuth consent screen'i tamamlayın.
3. `APIs & Services > Credentials > Create Credentials > OAuth client ID` seçin.
4. Application type olarak `Web application` seçin.
5. Authorized redirect URI olarak Supabase callback adresini ekleyin:

```text
https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
```

Google Cloud'dan aldığınız Client ID ve Client Secret'ı kopyalayın.

## 2. Supabase Dashboard

1. `Authentication > Providers > Google` bölümünü açın.
2. Google sağlayıcısını etkinleştirin.
3. Client ID ve Client Secret alanlarını doldurun.
4. `Authentication > URL Configuration` bölümünde:

Site URL:

```text
https://e-stor-react.vercel.app
```

Redirect URLs:

```text
https://e-stor-react.vercel.app
http://localhost:5173
http://localhost:5174
```

Preview deployment kullanıyorsanız ilgili Vercel preview URL'sini de Redirect URLs listesine ekleyin.

## 3. Vercel

Production environment için şu değişkenlerin tanımlı olduğundan emin olun:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Secret veya service-role anahtarını frontend'e eklemeyin. Değişkenleri ekledikten sonra yeni deployment oluşturun.

## Akış

Kullanıcı butona tıklar, Supabase Google'a yönlendirir, Google doğrulaması tamamlanır ve kullanıcı uygulamanın mevcut origin'ine geri döner. Supabase oturumunu URL'den algılar ve `AuthProvider` kullanıcıyı otomatik olarak günceller.
