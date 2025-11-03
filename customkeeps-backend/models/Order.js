// models/Order.js
const mongoose = require('mongoose');

const LineSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    qty: Number,
    unitPrice: Number,
    lineTotal: Number
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    lines: [LineSchema],
    summary: {
      subtotal: Number,
      shipping: Number,
      tax: Number,
      total: Number
    },
    payment: {
      provider: { type: String, default: 'stripe' },
      intentId: String,
      status: String,
      amount: Number,
      currency: String
    },
    customer: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
