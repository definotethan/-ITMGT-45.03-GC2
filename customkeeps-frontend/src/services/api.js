// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function jsonOrThrow(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

const mockProducts = [
  {
    _id: '1',
    name: 'Custom T-Shirt',
    description: 'Wear your story with personalized designs.',
    price: 499,
    stock: 50,
    image_url:
      'https://www.craftclothing.ph/cdn/shop/files/standard-plain-round-neck-shirt-white_00c6dd5a-c7fd-47b8-8170-64d80d9c871f_large.png?v=1750322628',
  },
  {
    _id: '2',
    name: 'Personalized Mug',
    description: 'Perfect for hot drinks and gifting.',
    price: 299,
    stock: 40,
    image_url:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGJmrGcmqH7PBkWXBOfUDn63Kwj7x92Up-fOFVu_7ifLMdkDuXrXqo_DIUdYh6RFxBSsM&usqp=CAU',
  },
  {
    _id: '3',
    name: 'Custom Tote Bag',
    description: 'Eco-friendly and stylish for your daily needs.',
    price: 399,
    stock: 30,
    image_url: 'https://teelaneph.com/cdn/shop/files/hctbb-zip_530x@2x.jpg?v=1709715695',
  },
];

export async function getProducts() {
  try {
    const data = await jsonOrThrow(await fetch(`${API_URL}/api/products`));
    const mapped = (data || []).map((p) => ({
      ...p,
      price: p.basePrice,
      image_url: p.imageUrl || '',
    }));
    if (mapped.length === 0) {
      console.warn('Backend returned no products; falling back to mock list.');
      return { data: mockProducts };
    }
    return { data: mapped };
  } catch (e) {
    console.warn('Product fetch failed; using mock list:', e?.message || e);
    return { data: mockProducts };
  }
}

export async function getQuote(items) {
  return jsonOrThrow(
    await fetch(`${API_URL}/api/pricing/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
  );
}

export async function getHealth() {
  return jsonOrThrow(await fetch(`${API_URL}/health`));
}
