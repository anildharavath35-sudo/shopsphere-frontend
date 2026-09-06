# ShopSphere Frontend

React + Vite + Tailwind CSS e-commerce storefront for ShopSphere.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api -> http://localhost:5000)
npm run build      # outputs to dist/
```

## Environment variables (`.env`)

Copy `.env.example` to `.env`.

- `VITE_RAZORPAY_KEY_ID` — public Razorpay key (only needed when the backend uses real Razorpay)
- `VITE_API_URL` — backend base URL. Leave unset for local dev (Vite proxy handles `/api`). Set to your deployed backend, e.g. `https://your-app.onrender.com` (no trailing slash).

## Deploying to Vercel

1. Import this repo on Vercel.
2. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist/`.
3. Add env var `VITE_API_URL` pointing at your Render backend.
4. `vercel.json` rewrites all routes to `index.html` for React Router (SPA) support.
