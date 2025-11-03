// src/App.jsx
import React, { useMemo, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import Home from './pages/Home.jsx';
import Cart from './pages/Cart.jsx';
const Orders = lazy(() => import('./pages/Orders.jsx'));

function App() {
  const [cartItems, setCartItems] = useState([]);

  const onAddToCart = (product, customization) => {
    setCartItems(prev => {
      const found = prev.find(i => i._id === product._id);
      if (found) {
        return prev.map(i => i._id === product._id
          ? { ...i, quantity: i.quantity + 1, customization: customization || i.customization }
          : i);
      }
      return [...prev, {
        _id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        customization: customization || null,
      }];
    });
  };

  const onRemove = (id) => setCartItems(prev => prev.filter(i => i._id !== id));
  const onUpdateQty = (id, qty) => setCartItems(prev => prev.map(i => i._id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  const cartCount = useMemo(() => cartItems.reduce((n, i) => n + i.quantity, 0), [cartItems]);

  return (
    <BrowserRouter>
      <header className="site-header">
        <Link to="/">CustomKeeps</Link>
        <div className="row" style={{ marginLeft: 'auto' }}>
          <Link to="/cart">Cart ({cartCount})</Link>
          <Link to="/orders">Orders</Link>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home onAddToCart={onAddToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} onRemove={onRemove} onUpdateQty={onUpdateQty} />} />
          <Route
            path="/orders"
            element={
              <Suspense fallback={<div>Loading orders…</div>}>
                <Orders />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
export default App;
