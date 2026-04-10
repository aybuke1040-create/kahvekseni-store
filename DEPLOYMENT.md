# Production Deployment Notes

## Backend API

Deploy the `backend` folder as a Node.js web service.

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm start
```

Health check:

```text
/health
```

Required backend environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=change_to_a_long_random_secret
JWT_REFRESH_SECRET=change_to_a_different_long_random_secret
WEB_URL=https://your-web-domain.com
API_PUBLIC_URL=https://your-api-domain.com
CORS_ORIGINS=https://your-web-domain.com
IYZICO_API_KEY=...
IYZICO_SECRET_KEY=...
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
PAYMENT_CALLBACK_URL=https://your-api-domain.com/api/payment/callback
```

Use Iyzico sandbox values while testing. Switch to production Iyzico values only when the store is ready for real payments.

## Web

Deploy the `web` folder to Vercel.

Required web environment variable:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## Mobile

Use the same public API URL for Expo/mobile builds.

Required mobile environment variable:

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

Do not use `localhost` in production web or mobile builds. `localhost` only works for local development on the same machine.
