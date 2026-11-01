const https = require('https');

https.get('https://qa-api.pharmacollege.lk/certificate-print-status/by-certificate_id/CREF4307/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
}).on('error', err => console.error(err));
