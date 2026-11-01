const fs = require('fs');
const files = [
  'front-web/src/app/page.tsx',
  'front-web/src/app/about/page.tsx',
  'front-web/src/app/alumni/page.tsx',
  'front-web/src/app/apply/page.tsx',
  'front-web/src/app/certificates/page.tsx',
  'front-web/src/app/contact/page.tsx',
  'front-web/src/app/courses/page.tsx',
  'front-web/src/app/courses/[slug]/page.tsx',
  'front-web/src/app/csr/page.tsx',
  'front-web/src/app/csr/[slug]/page.tsx',
  'front-web/src/app/blogs/page.tsx',
  'front-web/src/app/blogs/[slug]/page.tsx',
  'front-web/src/app/reviews/page.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const head = fs.readFileSync(f, 'utf8').substring(0, 100);
    const isClient = head.includes('use client');
    console.log((isClient ? '[CLIENT COMPONENT]' : '[SERVER COMPONENT (SSR)]').padEnd(26), f);
  }
});
