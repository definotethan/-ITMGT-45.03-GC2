# CustomKeeps – GC2

## Tech stack & versions
- Frontend: React 19.x, React Router 7.x, Vite 5.x, Vanilla CSS (global.css)  
- Backend: Node.js ≥18 (tested on v24.11.0), Express 4.x, Mongoose 8.x, Stripe SDK 16.x  
- Database: MongoDB Atlas (Free tier)  
- Deployment targets (recommended):  
  - Frontend: Vercel or Netlify (Free)  
  - Backend: Render or Railway (Free)  

## Setup instructions
1) Clone and install  
- git clone <repo-url>  
- cd customkeeps-frontend && npm install  
- cd ../customkeeps-backend && npm install  

2) Environment variables (do NOT commit .env)  
- customkeeps-backend/.env  
  - MONGODB_URI=mongodb+srv://gc2:gc2@gc2.xlphaiy.mongodb.net/customkeeps?retryWrites=true&w=majority&appName=GC2
  - STRIPE_SECRET_KEY=sk_test_51SOsreREYpg1B8S2BgIrFlBT8pZPDFUXJXyqXm8lfiB2ol5R50pKaLaDxn5RRkLWDfHrQsdvLC5mdXH4HKa2FrBY00EvSJbzRu
  - CURRENCY=php  
  - PORT=3000  
- customkeeps-frontend/.env  
  - VITE_API_URL=http://localhost:3000

3) Seed the database (from backend folder)  
- node seed.js

4) Run locally  
- Backend (from customkeeps-backend): node server.js  
- Frontend (from customkeeps-frontend): npm run dev (opens on http://localhost:5173)

5) Basic verification  
- Visit http://localhost:3000/health (should return ok:true)  
- Visit http://localhost:3000/api/products (should return seeded products)  
- Open http://localhost:5173 and complete a test checkout (Stripe test mode)

## API documentation & links
Base URL: BACKEND_URL (e.g., http://localhost:3000 or your deployed API)

- GET /health  
  - Response: { "ok": true, "time": "<ISO>" }

- GET /api/products  
  - Returns catalog array.  
  - Example item: { "_id":"...", "sku":"...", "name":"...", "basePrice":399, "description":"...", "imageUrl":"..." }

- GET /api/products/:id  
  - Returns a single product by MongoDB _id.

- POST /api/pricing/quote  
  - Body: { "items":[{ "productId":"<id>", "quantity":1 }...] }  
  - Response:  
    - { "lines":[{ "productId":"...", "name":"...", "qty":1, "unitPrice":399, "lineTotal":399 }...],  
      "summary": { "subtotal":399, "shipping":99|149, "tax":0, "total":498 } }

- POST /api/checkout/pay  
  - Body: {  
    "items":[{ "productId":"<id>", "quantity":1 }...],  
    "customer":{ "fullName":"...", "address":"...", "city":"...", "postalCode":"...", "country":"..." },  
    "testScenario":"success" | "decline"  
  }  
  - Behavior: Server recomputes totals, confirms a Stripe PaymentIntent (test mode), persists an Order.  
  - Response (success): { "status":"succeeded", "id":"pi_...", "amount":49800, "currency":"php", "orderId":"<mongo-id>" }  
  - Response (error): { "error":"<message>" }

- GET /api/orders  
  - Returns the latest 20 persisted orders with lines, summary, and payment metadata.

## Deployment link
- Frontend (Vercel/Netlify): https://YOUR-FRONTEND.example.com  
- Backend (Render/Railway): https://YOUR-BACKEND.example.com

## Before/after performance screenshots
- Place the images in /docs and reference here:  
  - Before (Lighthouse): ./docs/lighthouse-before.png  
  - After (Lighthouse): ./docs/lighthouse-after.png  
- Notes on changes: lazy-loaded images, route-level code splitting for Orders, reduced DOM depth, consistent card styles.

## Known issues & limitations
- Payments run only in Stripe test mode; no live payments configured.  
- Shipping uses a simple flat/tier rule (not carrier-rated); taxes are 0 for GC2 scope.  
- No authentication/authorization; Orders endpoint shows all recent orders.  
- Customization “file” is not persisted to cloud storage—UI stores filename only.  
- Secrets must never be committed (.env); if a secret was pushed, history must be scrubbed before pushing again.  
- Error handling is basic; transient network and rate-limit retries are not yet implemented.  
- Accessibility and i18n are minimal; further improvements recommended for production.
