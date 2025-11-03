# CustomKeeps (GC2)

## Tech stack & versions
- Frontend: React 19.x, React Router 7.x, Vite 5.x, Vanilla CSS  
- Backend: Node.js (tested on v24.11.0+), Express 4.x, Mongoose 8.x, Stripe SDK 16.x  
- Database: MongoDB Atlas (Free tier)  
- Hosting:  
  - Frontend: Vercel (Free) — https://itmgt4503-gc2.vercel.app/  
  - Backend: Render (Free) — https://itmgt-45-03-gc2.onrender.com

***

## Setup instructions

1) Clone and install  
- git clone (https://github.com/definotethan/-ITMGT-45.03-GC2)  
- cd customkeeps-frontend && npm install  
- cd ../customkeeps-backend && npm install

2) Environment variables (do NOT commit .env)  
- customkeeps-backend/.env  
  - MONGODB_URI=mongodb+srv://gc2:gc2@gc2.xlphaiy.mongodb.net/customkeeps?retryWrites=true&w=majority&appName=GC2
  - STRIPE_SECRET_KEY=sk_test_51SOsreREYpg1B8S2BgIrFlBT8pZPDFUXJXyqXm8lfiB2ol5R50pKaLaDxn5RRkLWDfHrQsdvLC5mdXH4HKa2FrBY00EvSJbzRu 
  - CURRENCY=php  
  - PORT=3000  
- customkeeps-frontend/.env  
  - VITE_API_URL=https://itmgt-45-03-gc2.onrender.com

3) Seed the database (from backend folder)  
- node seed.js

4) Run locally  
- Backend: node server.js (http://localhost:3000/health should show ok:true)  
- Frontend: npm run dev (http://localhost:5173)

5) Basic verification  
- Visit http://localhost:3000/api/products (should list items)  
- Open the app, add to cart, see server quote, submit payment (Stripe test mode), and check Orders page.

***

## API documentation & links

Base URL (prod): https://itmgt-45-03-gc2.onrender.com  
Base URL (local): http://localhost:3000

- GET /health  
  - Returns service liveness: { ok: true, time: "<ISO>" }

- GET /api/products  
  - Lists products from MongoDB.  
  - Example (prod): https://itmgt-45-03-gc2.onrender.com/api/products

- GET /api/products/:id  
  - Fetch a single product by _id.

- POST /api/pricing/quote  
  - Body: { "items":[{ "productId":"<id>", "quantity":1 }...] }  
  - Response:  
    - lines: [{ productId, name, qty, unitPrice, lineTotal }...]  
    - summary: { subtotal, shipping, tax, total }

- POST /api/checkout/pay  
  - Body: {  
    "items":[{ "productId":"<id>", "quantity":1 }...],  
    "customer":{ "fullName","address","city","postalCode","country" },  
    "testScenario":"success" | "decline"  
  }  
  - Behavior: Recomputes totals, confirms Stripe PaymentIntent (test mode), persists Order.  
  - Success: { status, id, amount, currency, orderId }  
  - Error: { error }

- GET /api/orders  
  - Lists latest 20 orders with lines, summary, and payment metadata.  
  - Example (prod): https://itmgt-45-03-gc2.onrender.com/api/orders

Stripe testing notes (server-confirmed): uses Stripe test payment methods (e.g., pm_card_visa) on the server, so no real card entry is required in the UI.

***

## Deployment link
- Frontend (Vercel): https://itmgt4503-gc2.vercel.app/  
- Backend (Render): https://itmgt-45-03-gc2.onrender.com

***

## Before/after performance screenshots
Add images to /docs and reference them here (or paste images directly in your README if preferred).
- Before: https://drive.google.com/drive/folders/1CAR_WlK9PrSM24jyCFWaaUtf6rurTv4U?usp=sharing 
- After:  
Optimizations included: lazy-loaded images for product cards, route-level code splitting for Orders, simplified DOM structure, consistent card styling.

***

## Known issues & limitations
- Payments run in Stripe test mode only (no live charges).  
- Shipping is a simple flat/tier rule; no real carrier quotes yet.  
- Taxes are set to 0 for GC2 scope.  
- No authentication/authorization; Orders endpoint shows recent orders.  
- Customization “file” isn’t uploaded to cloud storage (filename only stored in UI).  
- Secrets (.env) must never be committed. If a secret was pushed, the repo history must be scrubbed before pushing again.  
- Error handling is basic; retries/timeouts for external services are minimal.
[7](https://stackoverflow.com/questions/61732486/github-link-only-deploying-to-the-readme)
[8](https://dev.to/zand/a-comprehensive-and-user-friendly-project-readmemd-template-2ei8)
[9](https://www.docuwriter.ai/posts/readme-generator)
