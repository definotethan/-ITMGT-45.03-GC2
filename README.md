# CustomKeeps: Wear Your Story

Final project – Custom merchandise e‑commerce app built with Django REST Framework, React, and Stripe.

---

## Tech Stack

### Backend

- Django 5.2.8
- Django REST Framework 3.16.1
- djangorestframework-simplejwt 5.5.1 (JWT auth)
- PostgreSQL (production) / SQLite (local)
- Stripe 14.0.1 (PaymentIntent API)
- django-cors-headers 4.9.0
- django-admin-interface 0.31.0
- Gunicorn 23.0.0
- WhiteNoise 6.11.0
- python-dotenv 1.2.1

### Frontend

- React 19.2.0
- React Router DOM 7.9.6
- Vite 7.2.4
- @stripe/stripe-js 8.5.2
- @stripe/react-stripe-js 5.4.0
- react-hook-form 7.66.1
- Axios 1.13.2

### Deployment

- Backend: Render (Django API + PostgreSQL)
- Frontend: Vercel (React SPA)
- Database: PostgreSQL on Render

---

## Features

- Email/password registration and login using Django auth + JWT.
- Admin‑managed products with images and descriptions.
- Customization flow:
  - Choose base product (e.g., T‑shirt).
  - Select color, quantity.
  - Upload a design image.
- Cart with:
  - Merge of duplicate lines (same product + color + text + image) by increasing quantity.
  - Tiered bulk discounts (5% off for quantity ≥ 5, 10% off for quantity ≥ 10).
  - Coupon preview and application on top of bulk discounts.
- Checkout:
  - Stripe PaymentIntent integration (PHP currency).
  - “Hold to Pay” button to prevent accidental payment.
- Orders:
  - Persisted order and order items with stored pricing details.
  - Order history page with item breakdown, discounts, and total paid.
- Admin:
  - Django Admin for products, cart items, coupons, orders, and order items.
  - Image previews inside admin for designs.
  - Order status management with inline order items.

---

## Pricing and Discounts

The pricing pipeline for each order is:

1. Compute the raw subtotal as:

   - raw_subtotal = sum(price × quantity) over all cart items

2. Apply tiered bulk pricing per cart item:

   - If quantity ≥ 10: 10% discount on that line.
   - Else if quantity ≥ 5: 5% discount on that line.
   - Else: no bulk discount.

   Sum these discounted line totals to get subtotal_after_bulk.

3. Bulk discount:

   - bulk_discount = raw_subtotal − subtotal_after_bulk

4. Coupon discount:

   - If a valid coupon code is supplied and active, apply `coupon.discount_percent` to subtotal_after_bulk.
   - coupon_discount = subtotal_after_bulk × (percent / 100)

5. Total discount and final amount:

   - total_discount = bulk_discount + coupon_discount
   - final_amount = raw_subtotal − total_discount

These values are saved on the Order model as:

- total_amount = raw_subtotal (e.g., ₱5000 for 10 × ₱500)
- discount_amount = total_discount (e.g., ₱950 for bulk + coupon)
- final_amount = final_amount (e.g., ₱4050)

The Orders page reads these fields directly so the cart summary, Stripe payment amount, and stored order all stay consistent.

---

## Data Model (Simplified)

- User (Django auth)
- Product
  - name, description, price, image_url
- CartItem
  - user (FK → User)
  - product_name, price, quantity
  - base_color, customization_text, design_image_url
  - created_at, updated_at
- Coupon
  - code (unique)
  - discount_percent
  - valid_from, valid_to
  - active
- Order
  - user (FK → User)
  - order_id (string)
  - total_amount (raw subtotal)
  - discount_amount (bulk + coupon)
  - final_amount (amount charged)
  - coupon_code
  - status (preparing, ready_for_delivery, in_transit, delivered, completed)
  - payment_intent_id
  - created_at, updated_at
- OrderItem
  - order (FK → Order)
  - product_name
  - price (effective unit price after bulk discount)
  - quantity
  - base_color, customization_text, design_image_url

---

## API Overview

All endpoints are prefixed with `/api/`.

### Auth

- POST `/api/register/`
  - Body: `{ "username", "email", "password" }`
  - Creates a Django user via `create_user` so it appears in Django Admin.
- POST `/api/token/`
  - Body: `{ "username", "password" }`
  - Returns `{ "access", "refresh" }`.
- POST `/api/token/refresh/`
  - Body: `{ "refresh" }`
  - Returns `{ "access" }`.

### Products

- GET `/api/products/`
  - Auth required.
  - Returns list of products.

### Cart

All require `Authorization: Bearer <access>`.

- GET `/api/cart/` – get current user’s cart items.
- POST `/api/cart/` – add item or merge into existing one.

  Request body:

{
"product_name": "string",
"price": "decimal",
"quantity": "integer",
"base_color": "string",
"customization_text": "string",
"design_image_url": "string"
}

If a CartItem with the same user, product_name, base_color, customization_text, and design_image_url exists, its quantity is incremented instead of creating a new row.

- DELETE `/api/cart/{id}/` – remove specific item.
- DELETE `/api/cart/clear/` – clear all items for current user.

### Coupons

- POST `/api/preview_coupon/`
- Body: `{ "coupon_code": "string", "cart_total": "decimal" }`
- Returns `{ "valid": true/false, "discount_percent", "discount_amount" }` or an error.
- `cart_total` should be the subtotal after bulk discount (computed on the frontend).

### Orders

- GET `/api/orders/`
- Returns all orders for the authenticated user, with nested items and computed fields:
  - `total_amount`, `discount_amount`, `final_amount`
  - `discount` (alias), `total` (alias), `coupon` (alias), `date`

- POST `/api/orders/create_from_cart/`
- Body: `{ "payment_intent_id": "string", "coupon_code": "optional string" }`
- Applies bulk and coupon discounts as described above, creates an Order and OrderItems, clears the cart, and returns the new order.

### Payment

- POST `/api/checkout/pay/`
- Body: `{ "amount": "float", "coupon_code": "string" }`
- `amount` equals the cart “Total after discount”.
- Creates a Stripe PaymentIntent in PHP and returns `{ "clientSecret", "paymentIntentId" }`.
- Metadata includes `user_id`, `username`, and `coupon_code`.

---

## Frontend Behavior

### Navigation

- Fixed navbar with brand logo and links to Home, Cart, Orders, and Logout.
- Responsive layout:
- Desktop: inline nav links.
- Mobile: hamburger button toggles a slide‑down menu.

### Product & Customization Flow

- Home page lists products as cards.
- Clicking “Customize” opens a modal:
- Shows product preview, price, and form fields.
- Validates required fields (quantity, design image).
- “Add to Cart” and “Buy Now” both call the backend cart API.

### Cart Page

- Lists each customized item with:
- Product image (user upload URL).
- Product name, color, text, quantity, per‑item price.
- Summary panel shows:
- Subtotal (before discounts).
- Bulk Discount.
- Coupon Discount (from `/api/preview_coupon/`).
- Total after discount (sent to Stripe and stored as `final_amount`).
- Payment section:
- Stripe Elements card input.
- Total displayed based on the computed final amount.
- “Hold to Pay” button triggers payment confirmation and then creates the order.

### Orders Page

- Shows card per order with:
- Order ID, status badge, and date.
- Each order item (image, name, quantity, color, custom text).
- Summary section:
  - Subtotal (before discounts) = `total_amount`.
  - Total discount = `discount_amount` (bulk + coupon).
  - Optional “Coupon used: CODE”.
  - Total Paid = `final_amount`.

---

## Known Limitations

- No in‑browser drag‑and‑drop designer; users upload finished designs.
- Images are not compressed or optimized.
- Single currency (PHP).
- Order status updates and notifications are manual (via Django Admin).
- JWT tokens are stored in `localStorage` for simplicity; production deployments should consider more secure storage.

---

## AI Assistance

AI tools were used to help with:

- Designing API endpoints and serializers.
- Implementing Stripe PaymentIntent flow.
- Fixing discount math and aligning cart, payment, and orders.
- Improving responsiveness and UX details.

All logic was reviewed and integrated by the project team.

---

## Team

- Ethan Aquino
- Arianna Chan
- Paul Kim
- Harmonie Lin
- Luis Quintos
