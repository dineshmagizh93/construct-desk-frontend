const fs = require('fs');
const glob = require('glob');

const detailClass = 'sticky top-16 sm:top-20 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b -mt-4 mb-4';

const files = glob.sync('app/**/*.tsx');
let count = 0;

for (const file of files) {
  if (file.includes('projects/[id]') || file.includes('projects\\\\[id]')) continue;
  if (!file.includes('[id]')) continue;
  if (file.includes('edit')) continue; // Edit pages were already done

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We are looking for:
  // <div className="flex items-center justify-between">
  //   <div className="flex items-center gap-4">
  //     <Button variant="ghost" size="icon"
  // ... <ArrowLeft
  
  const regex = /(<div className="flex items-center justify-between"[\s\S]*?<ArrowLeft[\s\S]*?<\/Button>)/;
  
  if (regex.test(content)) {
    content = content.replace(/<div className="flex items-center justify-between">/, `<div className="${detailClass}">`);
  }

  // Handle tasks/page.tsx or anything using "flex flex-col sm:flex-row" originally
  const regex2 = /(<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[0-9]"[\s\S]*?<ArrowLeft[\s\S]*?<\/Button>)/;
  if (regex2.test(content)) {
     content = content.replace(/<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[0-9]">/, `<div className="${detailClass}">`);
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
    count++;
  }
}
console.log('Total detail pages patched: ' + count);
