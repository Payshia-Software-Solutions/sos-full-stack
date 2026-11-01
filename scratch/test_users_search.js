const https = require('https');

async function testSearch(term) {
  const url = `https://qa-api.pharmacollege.lk/users/search/${encodeURIComponent(term)}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ term, status: res.statusCode, results: JSON.parse(data) });
        } catch (e) {
          resolve({ term, status: res.statusCode, data: data.substring(0, 200) });
        }
      });
    }).on('error', err => resolve({ term, error: err.message }));
  });
}

async function run() {
  const terms = ['PA24600', 'Hansi', 'Kasun', 'Dilshan'];
  for (const t of terms) {
    const res = await testSearch(t);
    console.log(t, '=> Count:', Array.isArray(res.results) ? res.results.length : res.status, res.results ? res.results[0] : res.data);
  }
}

run();
