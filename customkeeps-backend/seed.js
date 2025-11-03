// seed.js
require('dotenv').config();
const { connectDB } = require('./db/mongo');
const Product = require('./models/Product');

async function run() {
  await connectDB();

  // Make seeding repeatable during dev
  await Product.deleteMany({});

  const items = [
    {
      sku: 'TEE-BASIC-001',
      name: 'CustomKeeps Basic Tee',
      basePrice: 399,
      description: 'Soft cotton tee ready for your text or image.',
      imageUrl: 'https://www.craftclothing.ph/cdn/shop/files/standard-plain-round-neck-shirt-white_00c6dd5a-c7fd-47b8-8170-64d80d9c871f_large.png?v=1750322628',
      customizationFields: { text: true, image: true },
    },
    {
      sku: 'MUG-WHITE-001',
      name: 'Personalized Mug',
      basePrice: 299,
      description: 'Classic white mug for meaningful keepsakes.',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGJmrGcmqH7PBkWXBOfUDn63Kwj7x92Up-fOFVu_7ifLMdkDuXrXqo_DIUdYh6RFxBSsM&usqp=CAU',
      customizationFields: { text: true, image: true },
    },
    {
      sku: 'TOTE-CANVAS-001',
      name: 'Custom Canvas Tote',
      basePrice: 399,
      description: 'Eco-friendly tote for everyday carry.',
      imageUrl: 'https://teelaneph.com/cdn/shop/files/hctbb-zip_530x@2x.jpg?v=1709715695',
      customizationFields: { text: true, image: true },
    },
  ];

  await Product.insertMany(items);
  console.log(`Seeded products: ${items.length}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
