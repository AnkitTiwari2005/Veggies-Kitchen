import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { MENU_SECTIONS } from '../src/menuData.js';

// Re-define schema to avoid CJS/ESM issues
const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  customizable: { type: Boolean, default: false },
  tags: [String]
});

const menuCategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: 'restaurant' },
  description: { type: String, default: '' },
  items: [itemSchema]
});

const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    await MenuCategory.deleteMany({});
    try {
      await MenuCategory.insertMany(MENU_SECTIONS);
      console.log('Insert successful');
    } catch (e) {
      console.error('Insert failed:', e.message);
      if (e.errors) {
        Object.keys(e.errors).forEach(k => console.error(e.errors[k].message));
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
