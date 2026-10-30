const fs = require('fs');
const file = 'front-web/src/lib/locales/si/courses.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/wyllACP6: '.*?'/, "wyllACP6: 'විෂබීජහරණය කළ ඖෂධ සංයෝග කිරීමේ ක්‍රමවේද සහ අන්තරායදායක ඖෂධ හැසිරවීම ප්‍රගුණ කරන්න.'");
content = content.replace(/topicModuleACP3_2: '.*?'/, "topicModuleACP3_2: 'උසස් විෂබීජහරණය කළ ඖෂධ සංයෝග කිරීමේ ක්‍රමවේද'");
fs.writeFileSync(file, content, 'utf8');
console.log('Cleaned up si/courses.ts successfully');
