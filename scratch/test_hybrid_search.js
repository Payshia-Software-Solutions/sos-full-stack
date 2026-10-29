const https = require('https');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function searchStudent(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Normalize index number: e.g. "PA/24/600" or "PA 24 600" -> "PA24600"
  const normalizedIndex = trimmed.replace(/[\/\s\-]/g, '').toUpperCase();
  
  // 1. If it looks like an index number (e.g., starts with PA or has digits)
  if (/^[A-Z]{1,4}\d+/i.test(normalizedIndex) || /^\d+$/.test(normalizedIndex)) {
    // Try get-student-full-info directly for exact username
    const fullInfo = await fetchJson(`https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=${encodeURIComponent(normalizedIndex)}`);
    if (fullInfo && fullInfo.studentInfo && fullInfo.studentInfo.username) {
      const s = fullInfo.studentInfo;
      return [{
        id: String(s.id),
        username: s.username,
        name_on_certificate: s.name_on_certificate || s.full_name || `${s.first_name} ${s.last_name}`.trim(),
        student_id: s.student_id,
        enrollments_count: Object.keys(fullInfo.studentEnrollments || {}).length
      }];
    }
  }

  // 2. Query users/search API
  // Extract clean search term (first token if spaces, or sanitized alpha-num)
  const cleanTerm = trimmed.replace(/[\/\\]/g, '').split(/\s+/)[0];
  const users = await fetchJson(`https://qa-api.pharmacollege.lk/users/search/${encodeURIComponent(cleanTerm)}`);
  
  if (Array.isArray(users) && users.length > 0) {
    return users.map(u => ({
      id: String(u.id),
      username: u.username,
      name_on_certificate: `${u.fname || ''} ${u.lname || ''}`.trim() || u.username,
      student_id: u.userid || u.username
    }));
  }

  return [];
}

async function run() {
  const testQueries = ['PA24600', 'PA/24/600', 'pa24600', 'Hansi', 'Kasun'];
  for (const q of testQueries) {
    const results = await searchStudent(q);
    console.log(`Query "${q}" => found ${results.length} results:`, results[0]);
  }
}

run();
