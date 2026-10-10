const fs = require('fs');

const content = fs.readFileSync('src/app/dashboard/pharma-reader/page.tsx', 'utf-8');

// Find the import statement for lucide-react
const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
if (!importMatch) {
    console.log("No lucide-react import found");
    process.exit(1);
}

const imported = new Set(importMatch[1].split(',').map(s => s.trim()).filter(s => s));

// Find all React component usages (e.g. <Component or <Component>)
const regex = /<([A-Z][a-zA-Z0-9]*)/g;
let match;
const usedComponents = new Set();

while ((match = regex.exec(content)) !== null) {
    usedComponents.add(match[1]);
}

const possibleLucideIcons = [
    'ArrowLeft', 'CheckCircle2', 'XCircle', 'Lightbulb', 'RefreshCw', 'Trophy', 'HelpCircle', 
    'Loader2', 'Sparkles', 'ChevronRight', 'Check', 'ZoomIn', 'Smile', 'Flame', 'ShieldAlert', 'Star', 'Play', 'Pause'
    // Let's just list components used but not imported
];

console.log("Imported from lucide:", Array.from(imported));
console.log("All Used Capitalized tags:", Array.from(usedComponents));

// Let's assume anything used that isn't imported from another place might be missing.
// We can check if it's imported anywhere
const allImports = new Set();
const importRegex = /import\s+({[^}]+}|[A-Za-z0-9_]+)\s+from\s+['"][^'"]+['"]/g;
let iMatch;
while ((iMatch = importRegex.exec(content)) !== null) {
    const vars = iMatch[1].replace(/[{}]/g, '').split(',').map(s => s.trim());
    vars.forEach(v => allImports.add(v));
}

const missing = [];
for (const comp of usedComponents) {
    if (!allImports.has(comp) && comp !== 'Fragment') {
        missing.push(comp);
    }
}

console.log("Potentially missing imports:", missing);
