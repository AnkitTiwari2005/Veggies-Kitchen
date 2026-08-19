const mongoose = require('mongoose');
const MenuCategory = require('./models/Menu');
const SiteSettings = require('./models/SiteSettings');
const ActivityLog = require('./models/ActivityLog');
require('dotenv').config({ path: '../.env' }); // Load from root dir

// Hardcoded default menu from menuData.js
const DEFAULT_MENU_SECTIONS = [
  {
    id: "starters",
    name: "Tandoori Starters",
    icon: "local_fire_department",
    description: "Smoky delights from our traditional clay oven.",
    items: [
      { id: "s1", name: "Paneer Tikka Shashlik", price: 350, description: "Charcoal-grilled cottage cheese cubes with bell peppers, marinated in yogurt and yellow chili.", image: "/images/hero_food_spread.png", customizable: false, featured: false, tags: ["Spicy"] },
      { id: "s2", name: "Hara Bhara Kebab", price: 290, description: "Delicate spinach and peas patties stuffed with dry fruits, pan-seared to perfection.", customizable: false, featured: false, tags: ["Healthy"] },
      { id: "s3", name: "Tandoori Soya Chaap", price: 320, description: "Protein-rich soya chunks marinated in a robust, smoky spice blend.", customizable: false, featured: false, tags: [] },
      { id: "s4", name: "Dahi Ke Sholay", price: 340, description: "Crispy bread pockets filled with hung curd, bell peppers, and coriander.", customizable: false, featured: false, tags: ["Chef's Special"] }
    ]
  },
  {
    id: "mains",
    name: "Main Course Classics",
    icon: "restaurant",
    description: "Rich, slow-cooked gravies to satisfy your soul.",
    items: [
      { id: "m1", name: "Dal Makhani", price: 380, description: "Whole black lentils and kidney beans simmered for 24 hours on slow charcoal, finished with butter and cream.", image: "/images/hero_food_spread.png", customizable: false, featured: true, tags: ["Signature"] },
      { id: "m2", name: "Shahi Kadhai Paneer", price: 420, description: "Wok-tossed paneer with crunchy onions and capsicum in a freshly ground coriander and red chili spice mix.", image: "/images/hero_food_spread.png", customizable: false, featured: true, tags: [] },
      { id: "m3", name: "Malai Kofta", price: 450, description: "Melt-in-mouth cottage cheese and potato dumplings in a luscious, sweet-savory cashew gravy.", customizable: false, featured: false, tags: [] },
      { id: "m4", name: "Pindi Chole", price: 350, description: "Authentic Amritsari style chickpeas cooked with dry roasted spices and tea leaves.", customizable: false, featured: false, tags: ["Spicy"] }
    ]
  },
  {
    id: "breads",
    name: "Artisan Breads",
    icon: "bakery_dining",
    description: "Fresh from the tandoor.",
    items: [
      { id: "b1", name: "Butter Garlic Naan", price: 90, description: "Soft, tearable flatbread infused with roasted garlic and butter.", customizable: false, featured: false, tags: [] },
      { id: "b2", name: "Tandoori Roti", price: 40, description: "Whole wheat bread baked in the clay oven.", customizable: false, featured: false, tags: ["Vegan"] },
      { id: "b3", name: "Pudina Paratha", price: 110, description: "Layered whole wheat bread with fresh mint leaves.", customizable: false, featured: false, tags: [] },
      { id: "b4", name: "Amritsari Kulcha", price: 140, description: "Crispy stuffed bread with spiced potatoes and onions, served with a dollop of butter.", customizable: false, featured: true, tags: [] }
    ]
  },
  {
    id: "rice",
    name: "Rice & Biryani",
    icon: "rice_bowl",
    description: "Aromatic basmati rice preparations.",
    items: [
      { id: "r1", name: "Vegetable Dum Biryani", price: 390, description: "Long grain basmati rice and seasonal vegetables slow-cooked in a sealed pot with saffron and whole spices.", customizable: false, featured: true, tags: ["Signature"] },
      { id: "r2", name: "Jeera Rice", price: 210, description: "Fragrant basmati rice tempered with cumin seeds.", customizable: false, featured: false, tags: ["Vegan"] },
      { id: "r3", name: "Peas Pulao", price: 240, description: "Light and fluffy rice with sweet green peas.", customizable: false, featured: false, tags: [] }
    ]
  }
];

const DEFAULT_SETTINGS = {
  heroBackdrop: { type: 'image', url: '/images/hero_food_spread.png' },
  menuBackdrop: { type: 'video', url: '/Chef_cooks_and_delivers_food_202608071354.mp4' }
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Clear existing menu and settings
    await MenuCategory.deleteMany({});
    await SiteSettings.deleteMany({});
    
    // Seed Menu
    for (const cat of DEFAULT_MENU_SECTIONS) {
      await MenuCategory.create(cat);
    }
    console.log("Menu seeded.");

    // Seed Settings
    const settingsArray = Object.keys(DEFAULT_SETTINGS).map(key => ({
      key,
      value: DEFAULT_SETTINGS[key]
    }));
    await SiteSettings.insertMany(settingsArray);
    console.log("Site settings seeded.");

    // Log Activity
    await ActivityLog.create({ action: "Database Seeded Initial Data", details: { method: "CLI Seed Script" }});
    console.log("Activity log created.");

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();
