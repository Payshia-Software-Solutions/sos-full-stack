const https = require('https');

function test(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ url, status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ url, status: res.statusCode, data: data.substring(0, 200) });
        }
      });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function run() {
  console.log('Testing 19125...');
  console.log('1. get-student-full-info?loggedUser=19125:', await test('https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=19125'));
  console.log('2. users/search/19125:', await test('https://qa-api.pharmacollege.lk/users/search/19125'));
  console.log('3. users/search/PA19125:', await test('https://qa-api.pharmacollege.lk/users/search/PA19125'));
  console.log('4. get-student-full-info?loggedUser=PA19125:', await test('https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=PA19125'));
}

run();
