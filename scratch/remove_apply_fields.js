const fs = require('fs');
const filePath = 'front-web/src/components/apply-flow.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Preferred Batch Schedule & Educational Qualification blocks in Step 1
const targetBlock = /\{\/\* Preferred Batch Schedule \*\/\}[\s\S]*?\{\/\* Next Button \*\/\}/;
const replacementBlock = `{/* Next Button */}`;

if (!targetBlock.test(content)) {
  console.error('Target block not found in apply-flow.tsx');
  process.exit(1);
}

content = content.replace(targetBlock, replacementBlock);

// 2. Remove Batch from Step 3 summary
const targetBatchRow = /\s*<div className="flex justify-between">\s*<span className="text-muted-foreground">\{language === 'si' \? 'කණ්ඩායම:' : 'Batch:'\}<\/span>\s*<span className="font-bold text-foreground">\{batchPreference\}<\/span>\s*<\/div>/;
content = content.replace(targetBatchRow, '');

// 3. Remove Batch from Step 4 confirmation summary
const targetBatchSummary = /\s*<p><span className="font-semibold text-foreground">\{language === 'si' \? 'කණ්ඩායම:' : 'Batch:'\}<\/span> \{batchPreference\}<\/p>/;
content = content.replace(targetBatchSummary, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed Preferred Schedule and Educational Qualification from apply-flow.tsx');
