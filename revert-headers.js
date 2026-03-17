const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.tsx');
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // For detail pages that original had <div className="flex items-center justify-between">
  // For tasks/page.tsx that had <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[0-9]">
  
  if (content.includes('sticky top-16')) {
    content = content.replace(/className="sticky top-16[^"]*"/g, 'className="flex items-center justify-between"');
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Reverted ' + file);
    count++;
  }
}
console.log('Total reverted: ' + count);
