// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCustomizer from '../components/ProductCustomizer';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Home({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await getProducts();
        setProducts(res.data || []);
        setState({ loading: false, error: '' });
      } catch (e) {
        setState({ loading: false, error: e.message || 'Failed to load' });
      }
    })();
  }, []);

  const handleCustomizationSubmit = ({ productId, file }) => {
    const product = products.find((p) => p._id === productId);
    if (product && file) {
      const customization = { designFileName: file.name, file };
      onAddToCart(product, customization);
      alert(`Customized ${product.name} added to cart.`);
    }
  };

  if (state.loading) return <p>Loading products…</p>;
  if (state.error) return <p style={{ color: 'crimson' }}>Error: {state.error}</p>;

  return (
    <div className="stack-lg">
      <h1 className="h1">CustomKeeps Products</h1>

      <div className="grid cols-3">
        {products.map((p) => (
          <div className="card" key={p._id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="stack">
          <h2 className="h2">Customize Your Product</h2>
          <ProductCustomizer products={products} onSubmit={handleCustomizationSubmit} />
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link to="/cart"><button className="btn secondary">View Cart & Checkout</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
