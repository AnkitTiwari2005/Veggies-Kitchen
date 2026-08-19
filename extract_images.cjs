// Script to extract title -> image URL mappings from JSON
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./leads-veggieskitchen.dotpe.in-1785832023516.json', 'utf8'));

// Only look at the first section (App State / Storage) which has actual CDN images
const imageMap = {};

for (const section of data.sections) {
  for (const item of section.items) {
    if (item.image && item.image.startsWith('https://cdn.dotpe.in')) {
      const title = item.title.trim();
      if (!imageMap[title]) {
        imageMap[title] = item.image;
      }
    }
  }
}

// Print all mappings
const sorted = Object.entries(imageMap).sort((a, b) => a[0].localeCompare(b[0]));
console.log(`Found ${sorted.length} unique title->image mappings:\n`);
for (const [title, url] of sorted) {
  console.log(`  "${title}": "${url}",`);
}
