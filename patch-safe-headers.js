const fs = require('fs');
const glob = require('glob');

const safeDetailClass = 'sticky top-16 sm:top-20 z-10 bg-background/90 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm border-b';

const files = glob.sync('app/**/*.tsx');
let count = 0;

for (const file of files) {
  if (file.includes('projects/[id]') || file.includes('projects\\\\[id]')) {
      if(!file.includes('edit')) continue; // already manual
  }
  if (!file.includes('[id]')) continue;

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We find the ArrowLeft button block and replace the wrapper class
  if (file.includes('edit')) {
      const regex = /(<div className="flex items-center gap-4">[\s\S]*?<ArrowLeft[\s\S]*?<\/div>\s*<\/div>)/;
      const match = content.match(regex);
      if (match) {
         content = content.replace(regex, `<div className="${safeDetailClass}">\n        $1\n      </div>`);
      }
  } else {
      const regex = /<div className="flex items-center justify-between">([\s\S]{1,300}?<ArrowLeft)/;
      const regex2 = /<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[0-9]">([\s\S]{1,300}?<ArrowLeft)/;
      
      if (regex.test(content)) {
          content = content.replace(regex, `<div className="${safeDetailClass}">$1`);
      } else if (regex2.test(content)) {
          content = content.replace(regex2, `<div className="${safeDetailClass}">$1`);
      }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
    count++;
  }
}
console.log('Total safe detail pages patched: ' + count);
