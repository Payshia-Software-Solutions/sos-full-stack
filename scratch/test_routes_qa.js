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
    'https://qa-api.pharmacollege.lk/users/search/PA24600',
    'https://qa-api.pharmacollege.lk/users/search/PA24600/',
    'https://qa-api.pharmacollege.lk/users/username/PA24600',
    'https://qa-api.pharmacollege.lk/users/username/PA24600/',
    'https://qa-api.pharmacollege.lk/certificate-verification?studentNumber=PA24600',
    'https://qa-api.pharmacollege.lk/certificate-verification/?studentNumber=PA24600',
    'https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=PA24600',
    'https://qa-api.pharmacollege.lk/userFullDetails/',
    'https://qa-api.pharmacollege.lk/userFullDetails/username/PA24600/',
  ];

  for (const url of tests) {
    const res = await testUrl(url);
    console.log(JSON.stringify(res, null, 2));
  }
}

run();
