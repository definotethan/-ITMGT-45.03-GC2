// src/components/ProductCard.jsx
import React from 'react';

export default function ProductCard({ product }) {
  return (
    <article>
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
        />
      ) : null}
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{product.name}</div>
      <div style={{ marginBottom: 6 }}>₱{(product.price || 0).toLocaleString()}</div>
      <div className="muted" style={{ fontSize: 14 }}>{product.description}</div>
    </article>
  );
}
