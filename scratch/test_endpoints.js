const https = require('https');

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, data: data.substring(0, 300) });
      });
    }).on('error', err => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  const tests = [
    'https://qa-api.pharmacollege.lk/userFullDetails/search/?q=PA24600',
    'https://qa-api.pharmacollege.lk/userFullDetails/search?q=PA24600',
    'https://qa-api.pharmacollege.lk/get-student-full-info/?loggedUser=PA24600',
    'https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=PA24600',
    'https://api.pharmacollege.lk/userFullDetails/search/?q=PA24600',
    'https://api.pharmacollege.lk/userFullDetails/search?q=PA24600',
    'https://api.pharmacollege.lk/get-student-full-info/?loggedUser=PA24600',
    'https://api.pharmacollege.lk/get-student-full-info?loggedUser=PA24600',
    'http://localhost/sos-full-stack/server/userFullDetails/search/?q=PA24600',
  ];

  for (const url of tests) {
    const res = await testUrl(url);
    console.log(JSON.stringify(res, null, 2));
  }
}

run();
