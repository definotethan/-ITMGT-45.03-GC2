// src/pages/Cart.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Payment from './Payment.jsx';
import { getQuote } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Cart({ cartItems, onRemove, onUpdateQty }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payResult, setPayResult] = useState(null);

  const itemsForQuote = useMemo(() => {
    return cartItems.map(i => ({
      productId: i.productId || i._id,
      quantity: i.quantity || 1
    }));
  }, [cartItems]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!itemsForQuote.length) { setQuote(null); return; }
      setLoading(true); setError(''); setPayResult(null);
      try {
        const res = await getQuote(itemsForQuote);
        if (!cancelled) setQuote(res);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to get quote');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [itemsForQuote]);

  if (!cartItems.length) return <p>Your cart is empty.</p>;

  const handleCheckout = async (formValues) => {
    try {
      setPayResult(null);
      const res = await fetch(`${API_URL}/api/checkout/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsForQuote,
          customer: formValues,
          testScenario: 'success'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setPayResult({ ok: true, data });
      alert(`Payment ${data.status}. Amount: ₱${(data.amount / 100).toLocaleString()}\nOrder ID: ${data.orderId}`);
    } catch (e) {
      setPayResult({ ok: false, error: e.message });
      alert(`Payment error: ${e.message}`);
    }
  };

  return (
    <div className="stack-lg">
      <h1 className="h1">Cart</h1>

      <div className="card stack">
        {cartItems.map(item => (
          <div key={item._id} className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div className="muted">₱{(item.price || 0).toLocaleString()} each</div>
              {item.customization?.designFileName && (
                <div className="muted" style={{ fontSize: 12 }}>
                  Custom: {item.customization.designFileName}
                </div>
              )}
            </div>
            <div className="row">
              <input
                type="number"
                min="1"
                value={item.quantity || 1}
                onChange={(e) => onUpdateQty(item._id, Number(e.target.value))}
                style={{ width: 84 }}
              />
              <button className="btn secondary" onClick={() => onRemove(item._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="totals">
        <div className="h2">Pricing</div>
        {loading && <p>Calculating server quote…</p>}
        {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
        {quote ? (
          <>
            <div>Server subtotal: ₱{quote.summary.subtotal.toLocaleString()}</div>
            <div>Shipping: ₱{quote.summary.shipping.toLocaleString()}</div>
            <div>Tax: ₱{quote.summary.tax.toLocaleString()}</div>
            <div className="total-strong">Grand total: ₱{quote.summary.total.toLocaleString()}</div>
          </>
        ) : (
          !loading && <p>Quote will appear here.</p>
        )}
      </div>

      <div className="card stack">
        <div className="h2">Payment & Shipping</div>
        <Payment onSubmit={handleCheckout} />
        {payResult && (
          <p style={{ color: payResult.ok ? 'green' : 'crimson' }}>
            {payResult.ok
              ? `Stripe status: ${payResult.data.status}. Order: ${payResult.data.orderId}`
              : `Error: ${payResult.error}`}
          </p>
        )}
      </div>
    </div>
  );
}
