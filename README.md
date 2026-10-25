# BatteryHouse PK – Lithium Battery Packs & Custom Assembly

Production web application and real-time operations portal for **BatteryHouse PK**, a Pakistan-based seller of lithium battery packs (12V, 24V, 36V, 48V built from 18650 cells), 3.7V lithium cells, custom packs, and PCB assembly and SMD soldering services.

---

## 1. Business Information
- **Name:** BatteryHouse PK
- **Location:** Pakistan
- **Phone & WhatsApp:** 03419257891 (WhatsApp: [wa.me/923419257891](https://wa.me/923419257891))
- **Email:** batteryhousepk82@gmail.com
- **Accepted Payments:**
  - Cash on Delivery (COD)
  - JazzCash on `03419257891` (Account Title: `Battery House PK`)
  - Easypaisa on `03419257891` (Account Title: `Battery House PK`)
  - Bank transfer (only if configured in `src/config/business.ts`)

---

## 2. Technical Stack
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Express (`server.ts`)
- **Backend & Database:** Supabase (PostgreSQL with Row Level Security, Realtime, and Storage)
  - URL: `https://cbulwgbesaiogpsfwxtl.supabase.co`
  - Safe Publishable Key: `sb_publishable_eaNAF_IUwhTAJ3bVv63SrQ_QMXTyppT`
- **RPC Endpoints:**
  - `place_order({ p_name, p_phone, p_city, p_address, p_payment_method, p_items })`: Server-verified order creation with stock check.
  - `track_order({ p_order_no, p_phone })`: Order tracking with payment method and status.
  - `attach_payment_proof({ p_order_no, p_phone, p_path, p_txn_id })`: Attaches screenshot and transaction ID to order.
- **Storage Buckets:**
  - `product-images`: Public bucket for product catalog photos.
  - `payment-proofs`: Private bucket for customer payment screenshots. Filename format follows `^BH-[0-9]+/[A-Za-z0-9._-]+$`. Admin views via 10-minute temporary signed URLs.
- **Search Engine & AI Bot Support:**
  - `server.ts` pre-renders semantic factual content for Googlebot, Bingbot, GPTBot, ClaudeBot, and PerplexityBot.
  - Dynamic `sitemap.xml` and `robots.txt` based on `VITE_SITE_URL`.

---

## 3. Configuration & Truthfulness Rules
All optional business claims (delivery times, couriers, warranty terms, bank transfer details) live in **`src/config/business.ts`** with empty/null defaults. Sections and badges in the UI render only when the owner fills these in.

---

## 4. Running Locally & Deployment

### Local Development
```bash
npm install
npm run dev
```
The application runs on port 3000 via `server.ts` (Express + Vite middleware).

### Building for Production
```bash
npm run build
npm run start
```
Starts `node server.ts` in production mode serving the compiled `dist/` directory.

### Static Hosting (Vercel, Netlify, Cloudflare Pages)
- Build Command: `npm run build`
- Output Directory: `dist`
- SPA fallback configured in `public/_redirects` (`/* /index.html 200`).
