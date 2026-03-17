const fs = require('fs');
const glob = require('glob');

const detailClass = 'sticky top-16 sm:top-20 z-10 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b -mt-4 mb-4';
const editClass = 'sticky top-16 sm:top-20 z-10 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b -mt-4 mb-6';

const files = glob.sync('app/**/*.tsx');
let count = 0;

for (const file of files) {
  if (file.includes('projects/[id]') || file.includes('projects\\\\[id]')) continue; // Already manually patched
  if (!file.includes('[id]')) continue;

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (file.includes('edit')) {
    // Edit pages
    if (content.includes('<ArrowLeft') && content.includes('<div className="flex items-center gap-4">')) {
       // Look for the header block
       const regex = /(<div className="flex items-center gap-4">[\s\S]*?<ArrowLeft[\s\S]*?<\/div>\s*<\/div>)/;
       const match = content.match(regex);
       if (match) {
         content = content.replace(regex, `<div className="${editClass}">\n        $1\n      </div>`);
       }
    }
  } else {
    // Detail pages
    if (content.includes('<ArrowLeft') && content.includes('<div className="flex items-center justify-between">')) {
       // We only want to replace the first occurrence where ArrowLeft is inside
       // Actually, we can just replace 'className="flex items-center justify-between"' if ArrowLeft is inside it
       // Let's use string operations carefully
       const startIdx = content.indexOf('<div className="flex items-center justify-between">');
       const arrowIdx = content.indexOf('<ArrowLeft');
       if (startIdx !== -1 && arrowIdx !== -1 && arrowIdx > startIdx && arrowIdx < startIdx + 500) {
          content = content.replace('<div className="flex items-center justify-between">', `<div className="${detailClass}">`);
       }
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
    count++;
  }
}
console.log('Total patched: ' + count);
