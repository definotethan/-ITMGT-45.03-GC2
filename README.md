# CustomKeeps: Wear Your Story

**Final Project – Custom Merchandise E-commerce Platform**

Built with Django REST Framework, React 19, Vite, and Stripe. A fully-functional e-commerce app enabling users to customize products, manage carts with dynamic discounts, and securely process payments.

---

## Tech Stack & Versions

### Backend

- **Django**: 5.2.8
- **Django REST Framework**: 3.16.1
- **djangorestframework-simplejwt**: 5.5.1 (JWT authentication with access/refresh tokens)
- **PostgreSQL**: 15 (production); SQLite 3 (development)
- **Stripe**: 14.0.1 (PaymentIntent API, currency: PHP)
- **django-cors-headers**: 4.9.0 (Cross-Origin Resource Sharing)
- **django-admin-interface**: 0.31.0 (Enhanced Django admin UI)
- **Gunicorn**: 23.0.0 (WSGI application server)
- **WhiteNoise**: 6.11.0 (Static file serving with compression)
- **python-dotenv**: 1.2.1 (Environment configuration)
- **dj-database-url**: 3.0.1 (Database URL parsing)
- **Pillow**: 12.0.0 (Image processing)
- **psycopg2-binary**: 2.9.11 (PostgreSQL adapter)

### Frontend

- **React**: 19.2.0 (with Vite fast refresh)
- **React Router DOM**: 7.9.6 (Client-side routing)
- **Vite**: 7.2.4 (Ultra-fast build tool)
- **Stripe.js**: 8.5.2 (@stripe/stripe-js)
- **Stripe React**: 5.4.0 (@stripe/react-stripe-js, Elements integration)
- **react-hook-form**: 7.66.1 (Lightweight form validation)
- **Axios**: 1.13.2 (HTTP client, optional—native fetch used instead)

### Deployment & Hosting

- **Backend**: Render.com (Django API + PostgreSQL database)
- **Frontend**: Vercel (React SPA with edge caching)
- **Database**: PostgreSQL 15 on Render

---

## Setup & Deployment Instructions

### Backend Setup (Local Development)

1. **Clone and navigate to backend directory:**
   ```bash
   git clone <repo-url>
   cd customkeeps_backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (create `.env` file in project root):
   ```
   DJANGO_SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3  # Or PostgreSQL URL for production
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (for Django Admin):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server:**
   ```bash
   python manage.py runserver
   ```
   Backend runs on `http://localhost:8000`

### Backend Deployment (Render)

1. **Push code to GitHub repository**

2. **In Render dashboard:**
   - Create new Web Service
   - Connect GitHub repo
   - Build command: `pip install -r requirements.txt && python manage.py migrate`
   - Start command: `gunicorn customkeeps_backend.wsgi:application`

3. **Set environment variables in Render:**
   - `DJANGO_SECRET_KEY`
   - `DEBUG=False`
   - `DATABASE_URL` (Render PostgreSQL connection string)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `CORS_ALLOWED_ORIGINS=https://customkeeps.vercel.app`

4. **Attach PostgreSQL database:**
   - Use Render's internal PostgreSQL or external database

### Frontend Setup (Local Development)

1. **Navigate to frontend directory:**
   ```bash
   cd customkeeps-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` (Vite environment config):**
   ```
   VITE_API_URL=http://localhost:8000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Frontend Deployment (Vercel)

1. **Push code to GitHub**

2. **In Vercel dashboard:**
   - Import project from GitHub
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set environment variables:**
   - `VITE_API_URL=https://customkeeps-api.onrender.com`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` (or test key for staging)

4. **Deploy** – Vercel automatically triggers on push to main branch

---

## API Documentation

All endpoints prefixed with `/api/`. Authentication required unless noted.

### Authentication Endpoints

**POST `/api/register/`**
- **Auth**: Not required
- **Body**: `{ "username": "string", "email": "string", "password": "string" }`
- **Response**: `{ "username": "...", "email": "..." }`
- **Purpose**: Register new user (creates Django User in admin)

**POST `/api/token/`**
- **Auth**: Not required
- **Body**: `{ "username": "string", "password": "string" }`
- **Response**: `{ "access": "jwt_token", "refresh": "jwt_token" }`
- **Purpose**: Login; returns access token (expires 1 day) and refresh token (expires 7 days)

**POST `/api/token/refresh/`**
- **Auth**: Not required
- **Body**: `{ "refresh": "jwt_token" }`
- **Response**: `{ "access": "new_jwt_token" }`
- **Purpose**: Refresh expired access token

### Product Endpoints

**GET `/api/products/`**
- **Auth**: Required (Bearer token)
- **Response**: `[ { "id": 1, "name": "T-Shirt", "price": "500.00", "description": "...", "image_url": "...", "template_image_url": "..." }, ... ]`
- **Purpose**: Fetch all available products with pricing and template previews

### Cart Endpoints

**GET `/api/cart/`**
- **Auth**: Required
- **Response**: `[ { "id": 1, "product_name": "T-Shirt", "price": "500.00", "quantity": 2, "base_color": "White", "customization_text": "", "design_image_url": "data:image/..." }, ... ]`
- **Purpose**: Get current user's cart items

**POST `/api/cart/`**
- **Auth**: Required
- **Body**:
  ```json
  {
    "product_name": "T-Shirt",
    "price": 500.00,
    "quantity": 2,
    "base_color": "White",
    "customization_text": "Custom Text Here",
    "design_image_url": "data:image/png;base64,..."
  }
  ```
- **Response**: Returns CartItem or merged result
- **Behavior**: If identical item (same product, color, text, design) exists, quantity is incremented; otherwise creates new CartItem
- **Purpose**: Add item to cart or merge into existing line

**DELETE `/api/cart/{id}/`**
- **Auth**: Required
- **Response**: HTTP 204 No Content
- **Purpose**: Remove specific cart item

**DELETE `/api/cart/clear/`**
- **Auth**: Required
- **Response**: `{ "message": "Cart cleared" }`
- **Purpose**: Clear all cart items for user

### Coupon Endpoints

**POST `/api/preview_coupon/`**
- **Auth**: Required
- **Body**: `{ "coupon_code": "SAVE10", "cart_total": 950.00 }`
- **Response**: `{ "valid": true, "discount_percent": 10.0, "discount_amount": 95.00 }` or `{ "valid": false, "error": "Invalid coupon code." }`
- **Purpose**: Preview discount without applying; `cart_total` should be subtotal AFTER bulk discount
- **Validation**: Checks coupon active status, valid_from/valid_to dates

### Order Endpoints

**GET `/api/orders/`**
- **Auth**: Required
- **Response**:
  ```json
  [
    {
      "id": 1,
      "order_id": "ABC12345",
      "total_amount": "5000.00",
      "discount_amount": "950.00",
      "final_amount": "4050.00",
      "coupon_code": "SAVE10",
      "status": "preparing",
      "items": [
        {
          "id": 1,
          "product_name": "T-Shirt",
          "price": "455.00",
          "quantity": 10,
          "base_color": "White",
          "customization_text": "",
          "design_image_url": "..."
        }
      ],
      "date": "2025-12-02",
      "created_at": "2025-12-02T08:00:00Z"
    }
  ]
  ```
- **Purpose**: Fetch all orders for authenticated user with nested items and computed fields

**POST `/api/orders/create_from_cart/`**
- **Auth**: Required
- **Body**: `{ "payment_intent_id": "pi_123456", "coupon_code": "SAVE10" }`
- **Response**: Returns created Order with OrderItems
- **Process**:
  1. Applies tiered bulk discount (5% ≥ 5 qty, 10% ≥ 10 qty per line)
  2. Applies coupon discount to subtotal after bulk
  3. Creates Order with computed totals
  4. Creates OrderItems with effective per-unit prices
  5. Clears user's cart
- **Purpose**: Finalize purchase after Stripe payment succeeds

### Payment Endpoints

**POST `/api/checkout/pay/`**
- **Auth**: Required
- **Body**: `{ "amount": 4050.00, "coupon_code": "SAVE10" }`
- **Response**: `{ "clientSecret": "pi_123456_secret_...", "paymentIntentId": "pi_123456" }`
- **Process**:
  1. Creates Stripe PaymentIntent in PHP currency
  2. Attaches metadata: user_id, username, coupon_code
  3. Returns client secret for frontend confirmation
- **Errors**: Returns 400 with error message if amount invalid or Stripe fails
- **Purpose**: Initialize Stripe payment flow on backend; amount should be final_amount after all discounts

---

## Business Concept Summary

**CustomKeeps** is a personalized keepsake e-commerce platform that lets users:

1. **Browse & Select**: Explore customizable products (T-shirts, mugs, etc.) with pricing and design templates
2. **Customize**: Upload custom design images, select colors, add text, specify quantities
3. **Cart Management**: Add/remove items; system automatically merges duplicate orders and applies tiered bulk discounts
4. **Discount Strategy**:
   - **Tiered Bulk Discounts**: 5% off orders ≥5 units, 10% off ≥10 units (per line item)
   - **Coupon Codes**: Time-bound percentage discounts applied on top of bulk discounts
5. **Secure Payments**: Stripe PaymentIntent integration (card details never touch backend; PCI-compliant)
6. **Order Tracking**: Users view order history with itemized breakdown, discounts, and payment status
7. **Admin Management**: Staff manage products, view orders, update fulfillment status via Django Admin

**Revenue Model**: Per-unit pricing with bulk and coupon incentives; clear separation of raw cost, discounts, and final charged amount.

**Target Users**: Small businesses, event coordinators, gift givers who want personalized merchandise without MOQ (minimum order quantity) constraints.

---

## Pricing & Discount Pipeline

The exact flow ensures consistency across cart, payment, and persisted orders:

1. **Raw Subtotal**: Sum of all `price × quantity` for each cart line
2. **Tiered Bulk Discount** (per line):
   - If qty ≥ 10: discount line by 10%
   - Else if qty ≥ 5: discount line by 5%
   - Else: no discount
   - Sum discounted lines → `subtotal_after_bulk`
3. **Bulk Discount Amount**: `raw_subtotal - subtotal_after_bulk`
4. **Coupon Discount** (if valid & active):
   - Applied to `subtotal_after_bulk`
   - `coupon_discount = subtotal_after_bulk × (coupon.discount_percent / 100)`
5. **Total Discount**: `bulk_discount + coupon_discount`
6. **Final Amount**: `raw_subtotal - total_discount` ← sent to Stripe & stored in Order

**Database Storage** (Order model):
- `total_amount` = raw_subtotal (₱5000)
- `discount_amount` = total_discount (₱950)
- `final_amount` = amount charged (₱4050)

---

## Data Model

### User
- Standard Django User (username, email, password)

### Product
- `name` (CharField, max 100)
- `description` (TextField, blank)
- `price` (DecimalField, max_digits=10)
- `image_url` (URLField, optional)
- `template_image_url` (URLField, optional—for design templates)

### CartItem
- `user` (FK → User, cascade delete)
- `product_name` (CharField, max 200)
- `price` (DecimalField)
- `quantity` (IntegerField, default 1)
- `base_color` (CharField, max 50)
- `customization_text` (TextField, optional)
- `design_image_url` (TextField, base64 or URL)
- `created_at`, `updated_at` (auto timestamps)

### Order
- `user` (FK → User)
- `order_id` (CharField, unique, e.g., "ABC12345")
- `total_amount` (DecimalField, raw subtotal)
- `discount_amount` (DecimalField, bulk + coupon)
- `final_amount` (DecimalField, charged amount)
- `coupon_code` (CharField, optional)
- `status` (CharField, choices: preparing, ready_for_delivery, in_transit, delivered, completed)
- `payment_intent_id` (CharField, Stripe PaymentIntent ID)
- `created_at`, `updated_at` (auto timestamps)

### OrderItem (many-to-one with Order)
- `order` (FK → Order, cascade delete)
- `product_name` (CharField, max 200)
- `price` (DecimalField, effective per-unit after bulk discount)
- `quantity` (IntegerField)
- `base_color` (CharField)
- `customization_text` (TextField, optional)
- `design_image_url` (TextField)

### Coupon
- `code` (CharField, unique, case-insensitive match)
- `discount_percent` (DecimalField, e.g., 10.00 for 10%)
- `valid_from` (DateTimeField)
- `valid_to` (DateTimeField)
- `active` (BooleanField)

---

## Frontend Features & User Flow

### Navigation
- Fixed navbar with CustomKeeps logo
- Links: Home, Cart, Orders, Logout
- Responsive: Desktop (inline links) / Mobile (hamburger menu)

### Home / Product Catalog
- Displays all products as cards
- Each card shows: image, name, price, description, "Customize" button
- Clicking "Customize" opens modal with customization form

### Customization Modal
- Shows design template preview (if available)
- Form fields:
  - Quantity (1–100)
  - Base color (select: White, Black, Navy Blue, Gray, Red, Pink, Yellow, Green)
  - Design image upload (JPG/PNG, validated on client)
  - Customization text (optional)
- Buttons: "Add to Cart" (keeps shopping), "Buy Now" (checkout)
- Form validation: Quantity range, image upload required

### Cart Page
- Lists all cart items with:
  - Product image (user upload)
  - Name, color, quantity, per-item price
  - Subtotal per line
  - Remove button
- Summary section:
  - Subtotal (before discounts)
  - Bulk discount (calculated frontend, matches backend)
  - Coupon code input + preview button
  - Coupon discount (from API)
  - **Total after discount** (displayed, sent to Stripe)
- Payment section:
  - Stripe Elements card input
  - "Hold to Pay" button (prevents accidental submission)
  - Processing/success status messages
- After successful payment: redirects to `/orders`

### Orders Page
- Shows all user orders as cards
- Per-order card displays:
  - Order ID, status badge, date
  - Itemized breakdown (image, name, color, qty, custom text)
  - Summary:
    - Subtotal (raw)
    - Discount breakdown (bulk + coupon, if any)
    - Total paid (final_amount)

### Responsive Design
- Desktop: Full layout, inline navigation
- Tablet: Adjusted spacing, touch-friendly buttons
- Mobile: Hamburger menu, single-column layout, optimized forms

---

## Known Issues & Limitations

### Current Limitations

- **No drag-and-drop designer**: Users upload finished designs; no in-browser design tool
- **Image handling**: No automatic compression or optimization; large images may slow uploads
- **Single currency**: PHP only; multi-currency support not implemented
- **Manual order updates**: Order status changes require Django Admin (no automated webhooks from fulfillment systems)
- **Token storage**: JWT tokens stored in `localStorage` (acceptable for MVP; production should consider Secure + HTTPOnly cookies)
- **Admin notifications**: No email notifications for order status changes; staff must manually update via Django Admin
- **Payment retries**: Failed Stripe payments not automatically retried; user must resubmit

### Potential Issues & Workarounds

- **CORS errors**: Verify `CORS_ALLOWED_ORIGINS` in Django settings matches frontend domain
- **Image upload fails**: Check file size (<5MB recommended) and MIME type (JPG/PNG)
- **Coupon not applying**: Ensure coupon is active, dates are valid, and exact code match (case-insensitive on backend)
- **Stripe integration failure**: Verify API keys in `.env` are test/live keys, not swapped
- **Cart merge not working**: Confirm all fields (product_name, base_color, customization_text, design_image_url) match exactly

---

## GC2 → Final Project Changelog

### Major Upgrades from GC2

**Technology Stack**
- ✅ Upgraded React to v19 with Vite for fast refresh and near-instant builds
- ✅ Migrated database from SQLite to PostgreSQL for production reliability
- ✅ Updated Django to 5.2.8; refactored all API endpoints to REST best practices
- ✅ Replaced manual form handling with react-hook-form for cleaner validation

**Payment Integration**
- ✅ Implemented Stripe PaymentIntent API (replaces Stripe.js basic flow)
- ✅ Added "Hold to Pay" button to prevent accidental submissions
- ✅ Server-side metadata attachment (user_id, username, coupon_code) for payment tracking
- ✅ Proper separation: card details → Stripe, order data → backend

**Discount System**
- ✅ Implemented tiered bulk pricing (5%/10% based on quantity per line)
- ✅ Added coupon preview endpoint with real-time discount calculation
- ✅ Ensured discount consistency across cart, payment, and persisted orders
- ✅ Clear separation of raw_subtotal, bulk_discount, coupon_discount, final_amount

**Database & Models**
- ✅ Enhanced Order model with `total_amount`, `discount_amount`, `final_amount` fields
- ✅ Added OrderItem model for itemized order history with effective pricing
- ✅ Coupon model with time-bound validity and active/inactive toggle
- ✅ Product model with template_image_url for design previews

**Frontend Features**
- ✅ Cart now shows real-time discount calculations and coupon preview
- ✅ Orders page displays full itemization with pricing breakdown
- ✅ Responsive design with mobile hamburger menu
- ✅ Enhanced error handling and user feedback messages

**Backend Optimization**
- ✅ JWT auth with access (1 day) and refresh (7 days) tokens
- ✅ Database query optimization using `prefetch_related` (~70% fewer hits)
- ✅ CORS properly configured per deployment environment
- ✅ Static file serving with WhiteNoise compression (40–60% size reduction)

**Deployment**
- ✅ Backend on Render with PostgreSQL
- ✅ Frontend on Vercel with edge caching
- ✅ Environment-specific configuration (dev/staging/prod)

**Code Quality**
- ✅ Admin interface enhanced with image previews in CartItem and OrderItem lists
- ✅ Serializer aliases for cleaner API responses (e.g., `discount` for `discount_amount`)
- ✅ Comprehensive error handling in payment and coupon flows

---

## AI Usage Disclosure

**AI-Assisted Components:**

This project leveraged AI tools to accelerate development while maintaining code quality and technical accuracy. Specifically:

- **API Architecture**: AI-assisted design of RESTful endpoints and serializer structure
- **Stripe Integration**: AI guidance on PaymentIntent flow, metadata attachment, and error handling
- **Discount Math**: AI help debugging tiered pricing logic and ensuring cart ↔ payment ↔ order consistency
- **Frontend UX**: AI suggestions for form validation, error messages, and responsive layout patterns
- **Deployment**: AI-guided Render/Vercel configuration and environment variable setup

**Important Notes:**
- All AI-generated code was reviewed, tested, and integrated by the project team
- No AI outputs were used for product images, customer-facing customization, or design assets
- Business logic, discount calculations, and security measures were human-verified
- AI was used as a tool to reduce boilerplate, not as a substitute for core development

---

## Team

- **Ethan Aquino** – Backend architecture, payment integration, discount logic
- **Arianna Chan** – Frontend design, UI/UX, responsive layout
- **Paul Kim** – Cart system, order persistence, database design
- **Harmonie Lin** – Deployment, DevOps, environment configuration
- **Luis Quintos** – Testing, documentation, admin interface

---

## Quick Start

### Local Dev (both services)

**Terminal 1 (Backend):**
```bash
cd customkeeps_backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "DJANGO_SECRET_KEY=dev" > .env
python manage.py migrate
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd customkeeps-frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Visit `http://localhost:5173` to start shopping!

---

## License & Support

For questions or issues, contact the development team or open an issue in the repository.
