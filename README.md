# CustomKeeps: Wear Your Story

Final project – Custom merchandise e‑commerce app built with Django REST Framework, React, and Stripe.

---

## Business Concept Summary

CustomKeeps is a niche e‑commerce platform where users can design and order personalized merch such as shirts or tote bags using their own artwork or text. The goal is to make small‑batch, story‑driven merchandise accessible to students, creators, and small groups who want commemorative items without operating a full print‑on‑demand store. The app focuses on a streamlined customization flow, transparent pricing with bulk and coupon discounts, and a simple order history view so users can track what they’ve created over time.

---

## Tech Stack & Versions

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

## Setup & Deployment Instructions

### 1. Backend (Django + DRF)

```bash
# Clone repo and go into backend folder
cd customkeeps_backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the backend root:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
CURRENCY=php
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SECRET_KEY=your_django_secret_key
DATABASE_URL=optional_postgres_url_for_prod
```

Run migrations and create admin user:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # http://localhost:8000
```

For production (Render):

- Set `DATABASE_URL`, `STRIPE_SECRET_KEY`, `DJANGO_SECRET_KEY`, and `DEBUG=False` in Render environment variables.
- Use Gunicorn as the WSGI server and WhiteNoise for static files.
- Point your Render service to `customkeeps_backend.wsgi:application`.

### 2. Frontend (React + Vite)

```bash
cd customkeeps-frontend

# Install dependencies
npm install
```

Create `.env` in the frontend root:

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Run locally:

```bash
npm run dev   # usually http://localhost:5173
```

For production (Vercel):

- Set `VITE_API_URL` to your Render backend URL, e.g. `https://customkeeps-api.onrender.com`.
- Set `VITE_STRIPE_PUBLISHABLE_KEY`.
- Build is handled by Vercel using `npm run build`.

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

   - `raw_subtotal = sum(price × quantity)` over all cart items.

2. Apply tiered bulk pricing per cart item:

   - If quantity ≥ 10: 10% discount on that line.
   - Else if quantity ≥ 5: 5% discount on that line.
   - Else: no bulk discount.

   Sum these discounted line totals to get `subtotal_after_bulk`.

3. Bulk discount:

   - `bulk_discount = raw_subtotal − subtotal_after_bulk`.

4. Coupon discount:

   - If a valid coupon code is supplied and active, apply `coupon.discount_percent` to `subtotal_after_bulk`.
   - `coupon_discount = subtotal_after_bulk × (percent / 100)`.

5. Total discount and final amount:

   - `total_discount = bulk_discount + coupon_discount`.
   - `final_amount = raw_subtotal − total_discount`.

These values are saved on the Order model as:

- `total_amount = raw_subtotal` (e.g., ₱5000 for 10 × ₱500).
- `discount_amount = total_discount` (e.g., ₱950 for bulk + coupon).
- `final_amount = final_amount` (e.g., ₱4050).

The Orders page reads these fields directly so the cart summary, Stripe payment amount, and stored order all stay consistent.

---

## Data Model (Simplified)

- **User** (Django auth)
- **Product**
  - `name`, `description`, `price`, `image_url`
- **CartItem**
  - `user` (FK → User)
  - `product_name`, `price`, `quantity`
  - `base_color`, `customization_text`, `design_image_url`
  - `created_at`, `updated_at`
- **Coupon**
  - `code` (unique)
  - `discount_percent`
  - `valid_from`, `valid_to`
  - `active`
- **Order**
  - `user` (FK → User)
  - `order_id` (string)
  - `total_amount` (raw subtotal)
  - `discount_amount` (bulk + coupon)
  - `final_amount` (amount charged)
  - `coupon_code`
  - `status` (`preparing`, `ready_for_delivery`, `in_transit`, `delivered`, `completed`)
  - `payment_intent_id`
  - `created_at`, `updated_at`
- **OrderItem**
  - `order` (FK → Order)
  - `product_name`
  - `price` (effective unit price after bulk discount)
  - `quantity`
  - `base_color`, `customization_text`, `design_image_url`

---

## API Documentation

All endpoints are prefixed with `/api/` and, unless stated otherwise, require:

```text
Authorization: Bearer <access_token>
```

### Auth

- **POST** `/api/register/`  
  Body:
  ```json
  { "username": "string", "email": "string", "password": "string" }
  ```
  Creates a Django user via `create_user` so it appears in Django Admin.

- **POST** `/api/token/`  
  Body:
  ```json
  { "username": "string", "password": "string" }
  ```
  Returns:
  ```json
  { "access": "jwt", "refresh": "jwt" }
  ```

- **POST** `/api/token/refresh/`  
  Body:
  ```json
  { "refresh": "jwt" }
  ```
  Returns:
  ```json
  { "access": "new_jwt" }
  ```

### Products

- **GET** `/api/products/`  
  Returns a list of products for authenticated users.

### Cart

All require `Authorization: Bearer <access>`.

- **GET** `/api/cart/`  
  Get current user’s cart items.

- **POST** `/api/cart/`  
  Add item or merge into existing one.

  Body:
  ```json
  {
    "product_name": "string",
    "price": "decimal",
    "quantity": "integer",
    "base_color": "string",
    "customization_text": "string",
    "design_image_url": "string"
  }
  ```

  If a `CartItem` with the same `user`, `product_name`, `base_color`, `customization_text`, and `design_image_url` exists, its quantity is incremented.

- **DELETE** `/api/cart/{id}/`  
  Remove a specific cart item.

- **DELETE** `/api/cart/clear/`  
  Clear all items for the current user.

### Coupons

- **POST** `/api/preview_coupon/`  
  Body:
  ```json
  {
    "coupon_code": "string",
    "cart_total": "decimal"
  }
  ```
  Returns either:
  ```json
  {
    "valid": true,
    "discount_percent": number,
    "discount_amount": number
  }
  ```
  or
  ```json
  {
    "valid": false,
    "error": "Invalid coupon code."
  }
  ```

### Orders

- **GET** `/api/orders/`  
  Returns all orders for the authenticated user, with nested items and computed fields:
  - `total_amount`, `discount_amount`, `final_amount`
  - Aliases: `discount`, `total`, `coupon`, `date`

- **POST** `/api/orders/create_from_cart/`  
  Body:
  ```json
  {
    "payment_intent_id": "string",
    "coupon_code": "optional string"
  }
  ```
  Applies bulk + coupon discounts, creates an `Order` and `OrderItem` records, clears the cart, and returns the new order.

### Payment

- **POST** `/api/checkout/pay/`  
  Body:
  ```json
  {
    "amount": 1234.56,
    "coupon_code": "optional string"
  }
  ```
  - `amount` should match “Total after discount”.
  - Creates a Stripe PaymentIntent (PHP) and returns:
  ```json
  {
    "clientSecret": "string",
    "paymentIntentId": "string"
  }
  ```

---

## Frontend Behavior

### Navigation

- Fixed navbar with brand logo and links to Home, Cart, Orders, and Logout.
- Responsive layout:
  - Desktop: inline nav links.
  - Mobile: hamburger button toggles a slide‑down menu.

### Product & Customization Flow

- Home page lists products as cards.
- Clicking **Customize** opens a modal:
  - Shows product preview, price, and form fields.
  - Validates required fields (quantity, design image).
  - **Add to Cart** and **Buy Now** both call the backend cart API.

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
  - **Hold to Pay** button triggers payment confirmation and then creates the order.

### Orders Page

- Shows one card per order with:
  - Order ID, status badge, and date.
  - Each order item (image, name, quantity, color, custom text).
- Summary section:
  - Subtotal (before discounts) = `total_amount`.
  - Total discount = `discount_amount` (bulk + coupon).
  - Optional “Coupon used: CODE”.
  - Total Paid = `final_amount`.

---

## Known Issues & Limitations

- No in‑browser drag‑and‑drop designer; users upload finished designs.
- Uploaded images are not compressed or optimized on the server.
- Single currency support (PHP) and Stripe as the only payment method.
- Order status updates and notifications are manual (via Django Admin); no email or SMS notifications.
- JWT tokens are stored in `localStorage` for simplicity; production‑grade deployments should consider more secure storage and refresh flows.
- No rate limiting or throttling configured on API endpoints.
- No pagination for product or order lists (acceptable for small datasets, but not yet optimized for large catalogs).

---

## GC2 → Final Project Changelog

**From GC2 prototype to final project, we implemented:**

### Authentication & Security

- Replaced mock auth with real Django auth + JWT via `djangorestframework-simplejwt`.
- Locked down product, cart, and order endpoints to authenticated users only.

### Pricing & Discounts

- Added tiered bulk discount logic (5% and 10%) applied per line item.
- Implemented coupon model, validation, and `/api/preview_coupon/` endpoint.
- Ensured cart totals, Stripe PaymentIntent amount, and stored order fields are consistent.

### Payments

- Upgraded from placeholder checkout to live Stripe PaymentIntent flow in PHP.
- Added “Hold to Pay” interaction with Stripe Elements and client‑side error handling.

### Data Model & Orders

- Introduced dedicated `Order` and `OrderItem` models with stored prices and statuses.
- Added order history page with detailed breakdown of items and discounts.

### Admin & Operations

- Configured Django Admin with image previews and inline order items.
- Added coupon management (create, activate/deactivate, set validity ranges).

### UI/UX & Frontend

- Switched to a modal‑based customization experience with validation and feedback.
- Improved cart and orders pages with clearer summaries and empty‑state messages.
- Refined responsive layout for mobile and desktop.

---

## AI Usage Disclosure

AI tools (including code assistants and text generators) were used to:

- Draft and refine Django REST Framework serializers, viewsets, and URL structures.
- Design and debug the discount pipeline (bulk + coupon) and ensure consistency across cart, payment, and orders.
- Integrate and troubleshoot the Stripe PaymentIntent flow and frontend Stripe Elements usage.
- Suggest improvements to React components, state management, and responsive CSS.
- Help write and reorganize project documentation, including this README.

All AI‑generated suggestions were reviewed, modified, and integrated by the project team, which remains responsible for the final code, behavior, and documentation of CustomKeeps.

---

## Team

- Ethan Aquino  
- Arianna Chan  
- Paul Kim  
- Harmonie Lin  
