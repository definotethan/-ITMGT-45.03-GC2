import React, { useState } from 'react';

export default function Payment({ onSubmit }) {
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Philippines',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="center-container" style={{ maxWidth: 500 }}>
      <h1>Payment & Shipping</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Full Name:
          <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>

        <label>
          Address:
          <input type="text" name="address" value={form.address} onChange={handleChange} required />
        </label>

        <label>
          City:
          <input type="text" name="city" value={form.city} onChange={handleChange} required />
        </label>

        <label>
          Postal Code:
          <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} required />
        </label>

        <label>
          Country:
          <input type="text" name="country" value={form.country} readOnly />
        </label>

        <label>
          Card Number:
          <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} required />
        </label>

        <label>
          Expiry Date:
          <input type="text" name="expiryDate" value={form.expiryDate} onChange={handleChange} placeholder="MM/YY" required />
        </label>

        <label>
          CVC:
          <input type="text" name="cvc" value={form.cvc} onChange={handleChange} required />
        </label>

        <button type="submit" style={{ padding: '8px 12px', background: '#206a5d', color: 'white', borderRadius: 4 }}>
          Submit Payment
        </button>
      </form>
    </div>
  );
}
