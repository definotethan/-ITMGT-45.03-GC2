import React, { useState } from 'react';

export default function ProductCustomizer({ products, onSubmit }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [file, setFile] = useState(null);

  const handleProductChange = (e) => setSelectedProductId(e.target.value);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Please select a product.');
      return;
    }
    if (!file) {
      alert('Please upload a design file.');
      return;
    }
    onSubmit({ productId: selectedProductId, file });
    setSelectedProductId('');
    setFile(null);
    e.target.reset();
  };

  return (
    <div className="product-customizer">
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: 28,
          maxWidth: 440,
          margin: 'auto',
          marginTop: 22,
          textAlign: 'left'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Customize Your Product</h2>

        <label style={{ display: 'block', marginBottom: 16 }}>
          Choose a product:
          <select
            value={selectedProductId}
            onChange={handleProductChange}
            style={{ marginLeft: 12, minWidth: 200 }}
          >
            <option value="">-- Select a product --</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 18 }}>
          Upload your design (image file):
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginLeft: 10 }}
          />
        </label>

        <button
          type="submit"
          style={{
            marginTop: 18,
            background: '#206a5d',
            color: 'white',
            padding: '10px 22px',
            borderRadius: 4,
            fontSize: 16,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Submit Customization
        </button>
      </form>
    </div>
  );
}
