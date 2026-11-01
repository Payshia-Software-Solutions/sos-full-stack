const http = require('http');

http.get('http://localhost/sos-full-stack/server/userFullDetails/search/?q=PA24600', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Local status:', res.statusCode);
    console.log('Local body:', data.substring(0, 200));
  });
}).on('error', err => {
  console.log('Local server connection error:', err.message);
});
