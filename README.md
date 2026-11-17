# Garnish Venue

Kokteyl barları için lüks, etkileşimli QR menü. Garnish'in dünyaları, el çizimi tasarımı ve kokteyl hesap motoru üzerine kurulu.

- `/` ürün sayfası
- `/v/demo` demo bar (Maison Noire), `/v/demo?world=sakura` aynı menü başka bir dünyada
- `/v/sirkeci` meyhane örneği (Anatolia)
- `/v/<bar>/<içki>` içki sayfası: hikâye, tat profili, hacim, alkol, kalori, alerjenler, alkolsüz versiyon

```
npm install
npm run dev        # http://localhost:3000
npm run build && npx next start -p 3200
npm run lint       # tsc
```

Supabase bağlamak için `.env.example` → `.env.local`, şemayı `supabase/migrations/0001_init.sql` ile kur.

Tescilli yazılım. Tüm hakları saklıdır.
