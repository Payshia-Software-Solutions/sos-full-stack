const https = require('https');

https.get('https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=PA24600', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Title:', parsed.title);
      console.log('studentInfo:', parsed.studentInfo);
      console.log('Enrollments keys:', Object.keys(parsed.studentEnrollments || {}));
      console.log('First enrollment:', Object.values(parsed.studentEnrollments || {})[0]);
    } catch (e) {
      console.log('Parse error:', e.message, data.substring(0, 500));
    }
  });
}).on('error', err => console.error(err));
