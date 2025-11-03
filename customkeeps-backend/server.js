// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./db/mongo');
const Product = require('./models/Product');
const Order = require('./models/Order');

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? require('stripe')(stripeSecret) : null;

const app = express();
app.use(cors());
app.use(express.json());

connectDB().catch(err => {
  console.error('DB connection error:', err);
  process.exit(1);
});

app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// -------- Products --------
app.get('/api/products', async (req, res) => {
  try {
    const items = await Product.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const item = await Product.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(400).json({ error: 'Invalid id' });
  }
});

// -------- Pricing --------
const TIER_RULES = [
  { min: 50, discount: 0.20 },
  { min: 25, discount: 0.15 },
  { min: 10, discount: 0.10 },
  { min: 5,  discount: 0.05 },
  { min: 1,  discount: 0.00 }
];

function getDiscountForQty(qty) {
  const q = Math.max(1, Number(qty || 1));
  for (const br of TIER_RULES) if (q >= br.min) return br.discount;
  return 0;
}
function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }

// Simple shipping rule: under ₱500 → ₱99, otherwise ₱149 (sample values)
function computeShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal < 500 ? 99 : 149;
}

async function priceLines(items) {
  let subtotal = 0;
  const lines = [];
  for (const line of items) {
    const qty = Math.max(1, Number(line.quantity || 1));
    const product = await Product.findById(line.productId).lean();
    if (!product) throw new Error('Invalid product in cart');

    const unitBase = Number(product.basePrice);
    const disc = getDiscountForQty(qty);
    const unitPrice = round2(unitBase * (1 - disc));
    const lineTotal = round2(unitPrice * qty);

    subtotal = round2(subtotal + lineTotal);
    lines.push({
      productId: product._id,
      name: product.name,
      qty,
      unitPrice,
      lineTotal
    });
  }
  return { lines, subtotal };
}

app.post('/api/pricing/quote', async (req, res) => {
  try {
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items' });
    }
    const { lines, subtotal } = await priceLines(items);
    const shipping = computeShipping(subtotal);
    const tax = 0;
    const total = round2(subtotal + shipping + tax);
    res.json({ lines, summary: { subtotal, shipping, tax, total } });
  } catch (err) {
    console.error('Quote error:', err);
    res.status(500).json({ error: 'Failed to calculate quote' });
  }
});

// -------- Checkout + Order persist --------
app.post('/api/checkout/pay', async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const { items = [], customer = {}, testScenario = 'success' } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items to charge' });
    }

    const { lines, subtotal } = await priceLines(items);
    const shipping = computeShipping(subtotal);
    const tax = 0;
    const total = round2(subtotal + shipping + tax);

    const amount = Math.round(total * 100);
    const currency = (process.env.CURRENCY || 'php').toLowerCase();
    const pm = testScenario === 'decline' ? 'pm_card_chargeDeclined' : 'pm_card_visa';

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      confirm: true,
      payment_method: pm,
      description: 'CustomKeeps order (test mode)',
      metadata: { items: JSON.stringify(items) }
    });

    const order = await Order.create({
      lines,
      summary: { subtotal, shipping, tax, total },
      payment: {
        provider: 'stripe',
        intentId: intent.id,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency
      },
      customer: {
        fullName: customer.fullName || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postalCode || '',
        country: customer.country || ''
      }
    });

    return res.json({
      status: intent.status,
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      orderId: order._id.toString()
    });
  } catch (err) {
    const msg = err?.message || 'Payment failed';
    console.error('Stripe/Order error:', msg);
    return res.status(400).json({ error: msg });
  }
});

// List latest orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(20).lean();
    res.json(orders);
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on ${PORT}`));

module.exports = app;
