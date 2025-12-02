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
- **django-admin-interface**: 0.31.0 (Enhanced Django admin UI with image previews)
- **Gunicorn**: 23.0.0 (WSGI application server)
- **WhiteNoise**: 6.11.0 (Static file serving with compression)
- **python-dotenv**: 1.2.1 (Environment configuration)
- **dj-database-url**: 3.0.1 (Database URL parsing)
- **Pillow**: 12.0.0 (Image processing)
- **psycopg2-binary**: 2.9.11 (PostgreSQL adapter)

### Frontend

- **React**: 19.2.0 (with Vite fast refresh)
- **React Router DOM**: 7.9.6 (Client-side routing)
- **Vite**: 7.2.4 (Ultra-fast build tool with SWC)
- **Stripe.js**: 8.5.2 (@stripe/stripe-js)
- **Stripe React**: 5.4.0 (@stripe/react-stripe-js, Elements integration)
- **react-hook-form**: 7.66.1 (Lightweight form validation)
- **Axios**: 1.13.2 (HTTP client, optional—native fetch used in production code)

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
   - Install command: `npm install`

3. **Set environment variables:**
   - `VITE_API_URL=https://customkeeps-api.onrender.com`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` (or test key for staging)

4. **Deploy** – Vercel automatically triggers on push to main branch

---

## API Documentation

All endpoints prefixed with `/api/`. Authentication required (Bearer JWT token) unless noted.

### Authentication Endpoints

**POST `/api/register/`**
- **Auth**: Not required
- **Body**: `{ "username": "string", "email": "string", "password": "string" }`
- **Response**: `{ "username": "...", "email": "..." }`
- **Purpose**: Register new user; creates Django auth User with hashed password

**POST `/api/token/`**
- **Auth**: Not required
- **Body**: `{ "username": "string", "password": "string" }`
- **Response**: `{ "access": "jwt_token", "refresh": "jwt_token" }`
- **Purpose**: Login; returns access token (expires 24 hours) and refresh token (expires 7 days)
- **Note**: Frontend stores tokens in `localStorage`; does NOT implement automatic refresh

**POST `/api/token/refresh/`**
- **Auth**: Not required
- **Body**: `{ "refresh": "jwt_token" }`
- **Response**: `{ "access": "new_jwt_token" }`
- **Purpose**: Refresh expired access token (endpoint available but NOT integrated into frontend)

### Product Endpoints

**GET `/api/products/`**
- **Auth**: Required (Bearer token)
- **Response**: `[ { "id": 1, "name": "T-Shirt", "price": "500.00", "description": "...", "image_url": "...", "template_image_url": "..." }, ... ]`
- **Purpose**: Fetch all available products with pricing and optional design template URLs

### Cart Endpoints

**GET `/api/cart/`**
- **Auth**: Required
- **Response**: `[ { "id": 1, "product_name": "T-Shirt", "price": "500.00", "quantity": 2, "base_color": "White", "customization_text": "", "design_image_url": "data:image/..." }, ... ]`
- **Purpose**: Get current authenticated user's cart items
- **Note**: Returns items with `created_at` timestamp

**POST `/api/cart/`**
- **Auth**: Required
- **Body**:
  ```json
  {
    "product_name": "T-Shirt",
    "price": 500.00,
    "quantity": 2,
    "base_color": "White",
    "customization_text": "",
    "design_image_url": "data:image/png;base64,..."
  }
  ```
- **Response**: Returns CartItem (merged if identical item exists)
- **Behavior**: If item exists with EXACT match on (product_name, base_color, customization_text, design_image_url), quantity increments; otherwise creates new CartItem
- **Note**: `customization_text` field accepted but frontend NEVER sends non-empty values (always empty string)
- **Purpose**: Add item to cart or merge into existing line

**DELETE `/api/cart/{id}/`**
- **Auth**: Required
- **Response**: HTTP 204 No Content
- **Purpose**: Delete specific cart item by ID

**DELETE `/api/cart/clear/`**
- **Auth**: Required
- **Response**: `{ "message": "Cart cleared" }`
- **Purpose**: Clear all cart items for authenticated user

### Coupon Endpoints

**POST `/api/preview_coupon/`**
- **Auth**: Required
- **Body**: `{ "coupon_code": "SAVE10", "cart_total": 950.00 }`
- **Response**: `{ "valid": true, "discount_percent": 10.0, "discount_amount": 95.00 }` or `{ "valid": false, "error": "Invalid coupon code." }`
- **Purpose**: Preview coupon discount without applying; `cart_total` must be subtotal AFTER bulk tiered discount
- **Validation**: Case-insensitive code match; checks active status, valid_from ≤ now ≤ valid_to
- **Usage**: Called from CartPage before final payment to show user discount preview

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
- **Serializer aliases**: `date` (from `created_at`), `total` (from `final_amount`), `discount` (from `discount_amount`), `coupon` (from `coupon_code`)
- **Purpose**: Fetch all orders for authenticated user with nested OrderItems and computed pricing

**POST `/api/orders/create_from_cart/`**
- **Auth**: Required
- **Body**: `{ "payment_intent_id": "pi_123456", "coupon_code": "SAVE10" }`
- **Response**: Returns created Order with nested OrderItems
- **Process**:
  1. Validates payment_intent_id via Stripe API (to verify successful payment)
  2. Retrieves all CartItems for authenticated user
  3. Calculates tiered bulk discount (5% if qty ≥ 5, 10% if qty ≥ 10 per line)
  4. Applies coupon discount to subtotal_after_bulk (if valid & active)
  5. Creates Order with totals: total_amount (raw), discount_amount (bulk + coupon), final_amount (charged)
  6. Creates OrderItems with effective per-unit prices (after bulk discount)
  7. Clears user's cart
  8. Returns persisted Order data with 201 Created
- **Purpose**: Finalize purchase after successful Stripe payment; called from Payment component's payment success callback

### Payment Endpoints

**POST `/api/checkout/pay/`**
- **Auth**: Required
- **Body**: `{ "amount": 4050.00, "coupon_code": "SAVE10" }`
- **Response**: `{ "clientSecret": "pi_123456_secret_...", "paymentIntentId": "pi_123456" }`
- **Process**:
  1. Converts PHP amount to cents (multiply by 100)
  2. Creates Stripe PaymentIntent with `automatic_payment_methods` enabled
  3. Attaches metadata: `user_id`, `username`, `coupon_code` for payment tracking & reconciliation
  4. Returns client secret (for frontend confirmation) + payment_intent_id
- **Errors**: Returns 400 with error description if amount ≤ 0 or Stripe API call fails
- **Purpose**: Initialize Stripe payment flow on backend; called from CartPage Payment component before card processing
- **Security**: Card details processed entirely by Stripe.js; never sent to backend (PCI-compliant)

---

## Business Concept Summary

**CustomKeeps** is a personalized keepsake e-commerce platform that lets users:

1. **Browse & Select**: Explore customizable products (T-shirts, mugs, etc.) with pricing and optional design template images
2. **Customize**: Upload custom design images (JPG/PNG), select base colors, specify quantities (1–100)
3. **Cart Management**: Add/remove items; system auto-merges duplicate items and applies tiered bulk discounts
4. **Discount Strategy**:
   - **Tiered Bulk Discounts**: 5% off per-line orders ≥5 units, 10% off ≥10 units (backend-calculated)
   - **Coupon Codes**: Time-bound percentage discounts applied on top of bulk discounts
5. **Secure Payments**: Stripe PaymentIntent with card tokenization (PCI-compliant)
6. **Order Tracking**: Users view complete order history with itemized breakdown, discount summary, and payment status
7. **Admin Management**: Django admin interface for staff to manage products, view orders, update fulfillment status, and preview images

**Revenue Model**: Per-unit pricing with bulk and coupon incentives; clear separation of raw cost, discounts, and final charged amount.

**Target Users**: Small businesses, event coordinators, gift givers who want personalized merchandise without MOQ (minimum order quantity) constraints.

---

## Pricing & Discount Pipeline

The exact flow ensures consistency across cart, payment, and persisted orders:

1. **Raw Subtotal**: Sum of all `price × quantity` for each cart line
2. **Tiered Bulk Discount** (per line, backend-calculated):
   - If qty ≥ 10: discount line by 10%
   - Else if qty ≥ 5: discount line by 5%
   - Else: no discount
   - Sum all discounted lines → `subtotal_after_bulk`
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
- Standard Django User (username, email, password via createsuperuser or registration)

### Product
- `name` (CharField, max 100)
- `description` (TextField, optional)
- `price` (DecimalField, max_digits=10, decimal_places=2)
- `image_url` (URLField, optional—product image displayed on frontend)
- `template_image_url` (URLField, optional—design reference template shown in customization modal)

### CartItem
- `user` (ForeignKey → User, cascade delete)
- `product_name` (CharField, max 200)
- `price` (DecimalField)
- `quantity` (IntegerField, default 1)
- `base_color` (CharField, max 50)
- `customization_text` (TextField, optional, blank=True—accepted in API but NEVER sent by frontend)
- `design_image_url` (TextField—stores base64-encoded or URL-based user design image)
- `created_at`, `updated_at` (auto timestamps)

### Order
- `user` (ForeignKey → User)
- `order_id` (CharField, unique, auto-generated UUID prefix, e.g., "ABC12345")
- `total_amount` (DecimalField—raw subtotal BEFORE any discounts)
- `discount_amount` (DecimalField—bulk + coupon combined)
- `final_amount` (DecimalField—amount actually charged to customer)
- `coupon_code` (CharField, optional—reference to applied coupon code)
- `status` (CharField, choices: preparing, ready_for_delivery, in_transit, delivered, completed)
- `payment_intent_id` (CharField—Stripe PaymentIntent ID for reconciliation)
- `created_at`, `updated_at` (auto timestamps)

### OrderItem (many-to-one with Order)
- `order` (ForeignKey → Order, cascade delete)
- `product_name` (CharField, max 200)
- `price` (DecimalField—effective per-unit price AFTER bulk discount applied)
- `quantity` (IntegerField)
- `base_color` (CharField)
- `customization_text` (TextField, optional—copied from CartItem)
- `design_image_url` (TextField—copied from CartItem)

### Coupon
- `code` (CharField, unique—case-insensitive lookup)
- `discount_percent` (DecimalField, max_digits=5, decimal_places=2, e.g., 10.00 for 10%)
- `valid_from` (DateTimeField)
- `valid_to` (DateTimeField)
- `active` (BooleanField, default True)

---

## Frontend Features & User Flow

### Navigation
- Fixed navbar with CustomKeeps logo and brand
- Auth state: Show Home, Cart (with item count), Orders, Logout if authenticated; otherwise show Home only
- Responsive: Desktop (inline nav links) / Mobile (hamburger menu with collapse)

### Home / Product Catalog
- Displays all products as cards in grid layout
- Each card shows: product image, name, description, price, and "Customize" button
- Click "Customize" → opens modal with customization form
- Hover effect: overlay with button re-labels to "Customize Now"

### Customization Modal
- Shows product preview (image, name, price)
- Displays design template preview (if available) as reference guide
- Form fields:
  - **Quantity**: Input 1–100 (validated on client)
  - **Base Color**: Dropdown (White, Black, Navy Blue, Gray, Red, Pink, Yellow, Green)
  - **Design Image Upload**: File input (JPG/PNG only, required, validated client-side)
  - **Customization Text**: Hidden/not rendered (backend accepts but frontend omits)
- Buttons: "Add to Cart" (keeps shopping), "Buy Now" (proceeds to checkout)
- Success message: "Added to cart!" (auto-hides after 2.5s)

### Cart Page
- Lists all cart items with:
  - Design image thumbnail (user upload)
  - Product name, base color, quantity, per-item price, subtotal per line
  - Remove button for each item
  - Empty cart message if no items
- **Summary section**:
  - Subtotal (before discounts)
  - Bulk discount (calculated frontend and backend; frontend mirrors backend logic)
  - Coupon code input + "Apply" button
  - Coupon discount amount (from `/api/preview_coupon/`)
  - **Final total after discount** (displayed; sent to Stripe)
- **Payment section** (if items present):
  - Stripe CardElement (secure card input)
  - "Hold to Pay" button with progress bar (requires 1.5-second hold to prevent accidental clicks)
  - Processing/success/error status messages
- After successful payment: redirects to `/orders`

### Orders Page
- Displays all user orders as cards in grid layout
- Per-order card shows:
  - Order ID, order status (plain text, no styling), date created
  - Itemized breakdown: design image, product name, color, quantity, custom text
  - Summary: subtotal (raw), total discount, total paid (final_amount)
  - Coupon used (if applied)
- Empty state message if no orders

### Responsive Design
- **Desktop** (> 900px): Full layout, inline navigation, multi-column grids
- **Tablet** (600–900px): Adjusted spacing, touch-friendly buttons
- **Mobile** (< 600px): Hamburger menu, single-column layout, stacked cart items, optimized modals

---

## Known Issues & Limitations

### Code-as-is Gaps (Current State)

1. **Customization Text Field**: Exists in backend API but NOT rendered in frontend form; always sent as empty string
2. **Token Refresh Not Implemented**: Frontend does NOT call `/api/token/refresh/` endpoint; users must re-login after 24-hour access token expiration
3. **No `fetchCurrentUser` Endpoint**: Function defined in `apiService.js` but `/api/user/` endpoint missing from backend
4. **No Image Compression**: Large base64 images stored directly in database without client-side compression or server-side validation
5. **Single Currency**: PHP only; no multi-currency support
6. **Manual Order Updates**: Order status changes require Django Admin (no fulfillment system webhooks)
7. **Token Storage**: JWT tokens stored in `localStorage` (acceptable for MVP; production should use Secure + HTTPOnly cookies)
8. **No Automated Emails**: No email notifications for order status changes; staff must manually update via Django Admin
9. **No Payment Retry Logic**: Failed Stripe payments must be manually resubmitted by user
10. **Order Status Display**: Status shown as plain text in OrdersPage; no CSS styling or badge components

### Potential Runtime Issues & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| **Session timeout after 24 hours** | Access token expires; refresh endpoint not integrated | Re-login or implement automatic token refresh interceptor in apiService.js |
| **CORS errors in deployment** | Frontend domain not in `CORS_ALLOWED_ORIGINS` | Verify Django settings match Vercel deployment URL |
| **Image upload fails** | File size > 5MB or wrong MIME type; base64 encoding adds 33% overhead | Compress images client-side before upload; check browser console for upload errors |
| **Coupon not applying** | Case mismatch or invalid dates | Ensure code matches exactly (case-insensitive on backend); verify coupon `active=True` and date range in Django Admin |
| **Stripe integration fails** | Swapped test/live API keys | Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env` |
| **Cart items not merging** | Field mismatch on base_color, customization_text, or design_image_url | Confirm all fields match exactly; design image URLs must be identical |
| **"Hold to Pay" button stuck** | Requires full 1.5-second hold; timer resets on release | User must hold button continuously for 1.5 seconds without interruption |
| **Customization text empty on orders** | Frontend never sends non-empty value | Field is design gap; frontend would need CustomizationForm text input |

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
- ✅ Added "Hold to Pay" button with visual progress bar to prevent accidental submissions
- ✅ Server-side metadata attachment (user_id, username, coupon_code) for payment tracking
- ✅ Proper separation: card details → Stripe via frontend, order data → backend only

**Discount System**
- ✅ Implemented tiered bulk pricing (5% ≥5 qty, 10% ≥10 qty per line)
- ✅ Added coupon preview endpoint with real-time discount calculation (`/api/preview_coupon/`)
- ✅ Ensured discount consistency across cart (frontend), payment (backend), and persisted orders
- ✅ Clear separation of raw_subtotal, bulk_discount, coupon_discount, final_amount in Order model

**Database & Models**
- ✅ Enhanced Order model with `total_amount`, `discount_amount`, `final_amount` fields
- ✅ Added OrderItem model for itemized order history with effective per-unit pricing
- ✅ Coupon model with time-bound validity and active/inactive toggle
- ✅ Product model with `template_image_url` for design reference templates

**Frontend Features**
- ✅ Cart now shows real-time discount calculations and coupon preview
- ✅ Orders page displays full itemization with pricing breakdown and order history
- ✅ Responsive design with mobile hamburger menu and single-column layout
- ✅ Enhanced error handling and user feedback messages throughout flows

**Backend Optimization**
- ✅ JWT auth with access token (24 hours) and refresh token (7 days)
- ✅ Database query optimization using `prefetch_related` (reduces query count ~70%)
- ✅ CORS properly configured per deployment environment
- ✅ Static file serving with WhiteNoise compression (40–60% size reduction)

**Admin Interface**
- ✅ Enhanced Django admin with image previews in CartItem, OrderItem, and OrderItem inline lists
- ✅ Serializer aliases for cleaner API responses (`discount` → `discount_amount`, `total` → `final_amount`, etc.)
- ✅ Comprehensive error handling in payment and coupon validation flows

**Deployment**
- ✅ Backend on Render with PostgreSQL (production database)
- ✅ Frontend on Vercel with edge caching and automatic CI/CD
- ✅ Environment-specific configuration (dev/staging/prod)

---

## AI Usage Disclosure

**AI-Assisted Components:**

This project leveraged AI tools to accelerate development while maintaining code quality and technical accuracy. Specifically:

- **API Architecture**: AI-assisted design of RESTful endpoints, serializer structure, and error responses
- **Stripe Integration**: AI guidance on PaymentIntent flow, metadata attachment, error handling, and client secret retrieval
- **Discount Math**: AI help debugging tiered pricing logic and ensuring consistency across cart → payment → order persistence
- **Frontend UX**: AI suggestions for form validation, error messages, responsive layout patterns, and modal interactions
- **Deployment**: AI-guided Render/Vercel configuration, environment variable setup, and CI/CD pipeline

**Important Notes:**
- All AI-generated code was reviewed, tested, and integrated by the project team
- No AI outputs were used for product images, customer-facing design, or content assets
- Business logic (discount calculations, payment flow, order creation) was human-verified
- AI was used as a tool to reduce boilerplate and accelerate scaffolding, not as a substitute for core development

---

## Team

- **Ethan Aquino** – Backend architecture, payment integration, discount logic
- **Arianna Chan** – Frontend design, UI/UX, responsive layout, modal interactions
- **Paul Kim** – Cart system, order persistence, database design
- **Harmonie Lin** – Deployment, DevOps, environment configuration, CI/CD
- **Luis Quintos** – Testing, documentation, admin interface enhancements

---

## Quick Start

### Local Dev (both services)

**Terminal 1 (Backend):**
```bash
cd customkeeps_backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "DJANGO_SECRET_KEY=dev-key" > .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd customkeeps-frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_..." >> .env.local
npm run dev
```

Visit `http://localhost:5173` to start shopping!

---

## Future Improvements

To address current limitations and enhance functionality:

1. **Token Refresh Interceptor**: Implement fetch interceptor in `apiService.js` to automatically refresh access tokens before expiration
2. **Enable Customization Text**: Render text input in `CustomizationForm` and pass non-empty values to API
3. **Implement User Profile**: Add `/api/user/` endpoint in backend; call from frontend to display user info
4. **Image Optimization**: Add client-side image compression before base64 encoding; add server-side size validation (max 5MB)
5. **Order Status Styling**: Add CSS badge components with color-coding for order statuses
6. **Webhook Integration**: Set up Stripe webhooks for automatic payment confirmation without relying on frontend redirect
7. **Multi-currency Support**: Add currency conversion service; store prices with currency code
8. **Email Notifications**: Integrate SendGrid or AWS SES for transactional order status update emails
9. **Image Designer Tool**: Integrate Fabric.js or similar for in-browser design preview and editing
10. **Rate Limiting**: Add DRF throttle classes to API endpoints to prevent abuse
11. **Inventory Management**: Add stock levels to Product model; prevent overselling
12. **Order Cancellation**: Allow users to cancel orders before fulfillment; refund via Stripe
