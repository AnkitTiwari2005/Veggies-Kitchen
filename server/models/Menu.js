const mongoose = require('mongoose');

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

module.exports = mongoose.model('MenuCategory', menuCategorySchema);
