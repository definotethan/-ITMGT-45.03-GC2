// src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load orders');
        setOrders(data);
        setState({ loading: false, error: '' });
      } catch (e) {
        setState({ loading: false, error: e.message || 'Error' });
      }
    })();
  }, []);

  if (state.loading) return <p>Loading orders…</p>;
  if (state.error) return <p style={{ color: 'crimson' }}>Error: {state.error}</p>;

  return (
    <div className="stack-lg">
      <h1 className="h1">Recent Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(o => (
          <div key={o._id} className="card stack">
            <div>
              <strong>Order:</strong> {o._id} • <strong>Status:</strong> {o.payment?.status} •{' '}
              <strong>Total:</strong> ₱{(o.summary?.total || 0).toLocaleString()}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              Placed: {new Date(o.createdAt).toLocaleString()}
            </div>
            <div className="stack">
              {(o.lines || []).map((l, idx) => (
                <div key={idx} className="row" style={{ justifyContent: 'space-between' }}>
                  <div>{l.qty} × {l.name}</div>
                  <div>₱{(l.lineTotal || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
