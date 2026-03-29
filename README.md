# KAHVEKSENİ — E-Ticaret Platformu

Kahve markası için full-stack online satış platformu: **Web Sitesi** + **iOS/Android Mobil Uygulama** + **REST API**.

## Proje Yapısı

```
kahvekseni/
├── backend/          # Node.js + Express + TypeScript + Prisma + PostgreSQL
├── web/              # React 18 + Vite + Tailwind CSS + TypeScript
├── mobile/           # React Native + Expo (iOS & Android)
└── docker-compose.yml
```

## Hızlı Başlangıç

### 1. Veritabanını Başlat (Docker)
```bash
cd kahvekseni
docker-compose up -d postgres redis
```

### 2. Backend
```bash
cd backend
npm install
# .env dosyasını oluşturun (.env.example'dan kopyalayın)
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
# API: http://localhost:5000
```

### 3. Web Sitesi
```bash
cd web
npm install
npm run dev
# Web: http://localhost:3000
```

### 4. Mobil Uygulama
```bash
cd mobile
npm install
npx expo start
# Expo Go ile telefonda tarayın ya da simulator'de açın
```

---

## Ortam Değişkenleri (backend/.env)

```env
DATABASE_URL="postgresql://kahvekseni:password@localhost:5432/kahvekseni_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
IYZICO_API_KEY=sandbox-api-key
IYZICO_SECRET_KEY=sandbox-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
WEB_URL=http://localhost:3000
```

---

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/register | Kayıt |
| POST | /api/auth/login | Giriş |
| POST | /api/auth/refresh | Token yenile |
| GET | /api/auth/me | Profil |
| GET | /api/products | Ürün listesi |
| GET | /api/products/:slug | Ürün detayı |
| GET | /api/products/categories | Kategoriler |
| POST | /api/orders | Sipariş oluştur |
| GET | /api/orders | Siparişlerim |
| POST | /api/payment/init | Ödeme başlat |
| POST | /api/payment/callback | İyzico webhook |
| GET | /api/loyalty | Puan bilgisi |
| GET | /api/loyalty/tiers | Tier açıklamaları |
| POST | /api/b2b/request | Toptan talep formu |

---

## Özellikler

- ✅ Perakende & toptan (B2B) satış
- ✅ Ürün kataloğu (kategori, arama, filtre)
- ✅ Varyant desteği (gramaj, öğütme tipi)
- ✅ Sepet yönetimi
- ✅ İyzico ödeme entegrasyonu
- ✅ Sadakat / puan programı (Bronz → Gümüş → Altın)
- ✅ JWT + Refresh token auth
- ✅ Çoklu dil (TR/EN)
- ✅ iOS & Android mobil uygulama
- ✅ Biyometrik giriş (Face ID / Touch ID)
- ✅ Docker Compose altyapısı

---

## Varsayılan Admin Hesabı (seed sonrası)

```
E-posta: admin@kahvekseni.com
Şifre: Admin123!
```

## Marka Renkleri

| Renk | Hex |
|------|-----|
| Koyu Kahverengi | `#3B1F0A` |
| Krem | `#F5E6D3` |
| Altın | `#C8963E` |
