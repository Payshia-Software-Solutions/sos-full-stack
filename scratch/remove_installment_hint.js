const fs = require('fs');

// 1. Update featured-courses.tsx
const fcPath = 'front-web/src/components/featured-courses.tsx';
let fcContent = fs.readFileSync(fcPath, 'utf8');

// Remove getInstallmentHint function
fcContent = fcContent.replace(/function getInstallmentHint[\s\S]*?\n\}/, 'function getInstallmentHint(feeNumber: number, lang: string) {\n  return null;\n}');

// Remove installmentText from JSX if present
const installmentJsx = /\s*\{installmentText && \([\s\S]*?<\/span>\s*\)\}/;
fcContent = fcContent.replace(installmentJsx, '');

fs.writeFileSync(fcPath, fcContent, 'utf8');
console.log('Updated featured-courses.tsx');

// 2. Update course-catalog.tsx
const ccPath = 'front-web/src/components/course-catalog.tsx';
let ccContent = fs.readFileSync(ccPath, 'utf8');

ccContent = ccContent.replace(/const getInstallmentHint = [\s\S]*?\n\};/, 'const getInstallmentHint = (fee: number, lang: string) => null;');
const ccInstallmentJsx = /\s*\{installmentText && \([\s\S]*?<\/span>\s*\)\}/;
ccContent = ccContent.replace(ccInstallmentJsx, '');

fs.writeFileSync(ccPath, ccContent, 'utf8');
console.log('Updated course-catalog.tsx');
