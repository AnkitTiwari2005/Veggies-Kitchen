const mongoose = require('mongoose');
const MenuCategory = require('./models/Menu');
require('dotenv').config({ path: '../.env' });
const leadsData = require('../leads-veggieskitchen.dotpe.in-1785832023516.json');

async function seedLeads() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    await MenuCategory.deleteMany({});
    console.log("Cleared existing menu categories.");

    let sectionsAdded = 0;
    let itemsAdded = 0;

    for (const section of leadsData.sections) {
      const sectionName = section.section_name || 'Uncategorized';
      const sectionId = sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const validItems = section.items.filter(item => {
        // filter out broken or no images
        if (!item.image || item.image.trim() === '') return false;
        // basic url check
        if (!item.image.startsWith('http')) return false;
        return true;
      });

      if (validItems.length === 0) continue;

      const itemsToInsert = validItems.map(item => {
        const itemName = item.title || 'Unnamed Item';
        const itemId = itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return {
          id: itemId,
          name: itemName,
          price: parseFloat(item.price) || 0,
          description: item.description || '',
          image: item.image,
          customizable: false,
          featured: false,
          tags: []
        };
      });

      const newCategory = {
        id: sectionId,
        name: sectionName,
        icon: 'restaurant', // default icon
        description: '',
        items: itemsToInsert
      };

      await MenuCategory.create(newCategory);
      sectionsAdded++;
      itemsAdded += itemsToInsert.length;
    }

    console.log(`Seeding complete: ${sectionsAdded} sections and ${itemsAdded} items added.`);

  } catch (error) {
    console.error("Error seeding leads data:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedLeads();
