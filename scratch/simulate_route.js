const https = require('https');

const LMS_API_URL = 'https://qa-api.pharmacollege.lk';

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ ok: false, status: res.statusCode, data: null });
        }
      });
    }).on('error', err => resolve({ ok: false, error: err.message }));
  });
}

async function simulateRoute(q) {
  const trimmed = q.trim();
  const cleanTerm = trimmed.replace(/[\/\\ \-_]/g, "").toUpperCase();

  const results = [];
  const seenUsernames = new Set();

  const addItem = (item) => {
    const key = (item.username || item.id || "").toUpperCase();
    if (!key || seenUsernames.has(key)) return;
    seenUsernames.add(key);
    results.push(item);
  };

  // Strategy 1: CREF
  if (/^CREF/i.test(cleanTerm)) {
    const certRes = await fetchJson(`${LMS_API_URL}/certificate-print-status/by-certificate_id/${encodeURIComponent(cleanTerm)}/`);
    if (certRes.ok && certRes.data?.student_number) {
      const studentRes = await fetchJson(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(certRes.data.student_number)}`);
      if (studentRes.ok && studentRes.data?.studentInfo) {
        const s = studentRes.data.studentInfo;
        addItem({
          id: String(s.id),
          username: s.username,
          name_on_certificate: s.name_on_certificate || s.full_name,
          student_id: s.student_id,
          strategy: 'Strategy 1 (CREF)'
        });
      }
    }
  }

  // Strategy 2: Student index format
  if (/^[A-Z]{1,4}\d+/i.test(cleanTerm) || /^\d{3,}$/.test(cleanTerm)) {
    const studentRes = await fetchJson(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanTerm)}`);
    if (studentRes.ok && studentRes.data?.studentInfo?.username) {
      const s = studentRes.data.studentInfo;
      addItem({
        id: String(s.id),
        username: s.username,
        name_on_certificate: s.name_on_certificate || s.full_name,
        student_id: s.student_id,
        strategy: 'Strategy 2 (Index direct)'
      });
    }
  }

  // Strategy 3: Users search
  const searchToken = trimmed.replace(/[\/\\]/g, "").split(/\s+/)[0];
  if (searchToken.length >= 2) {
    const usersRes = await fetchJson(`${LMS_API_URL}/users/search/${encodeURIComponent(searchToken)}`);
    if (usersRes.ok && Array.isArray(usersRes.data)) {
      for (const u of usersRes.data) {
        addItem({
          id: String(u.id),
          username: u.username,
          name_on_certificate: `${u.fname || ""} ${u.lname || ""}`.trim() || u.username,
          student_id: u.userid || u.username,
          strategy: 'Strategy 3 (Users search)'
        });
      }
    }
  }

  // Strategy 4: Fallback
  if (results.length === 0) {
    const fallbackRes = await fetchJson(`${LMS_API_URL}/userFullDetails/search/?q=${encodeURIComponent(trimmed)}`);
    if (fallbackRes.ok && Array.isArray(fallbackRes.data)) {
      for (const item of fallbackRes.data) {
        addItem({
          id: String(item.id),
          username: item.username,
          name_on_certificate: item.name_on_certificate || item.username,
          student_id: item.student_id,
          strategy: 'Strategy 4 (Fallback)'
        });
      }
    }
  }

  return results;
}

async function main() {
  console.log('Query "19125":', JSON.stringify(await simulateRoute("19125"), null, 2));
  console.log('Query "PA19125":', JSON.stringify(await simulateRoute("PA19125"), null, 2));
  console.log('Query "24600":', JSON.stringify(await simulateRoute("24600"), null, 2));
  console.log('Query "PA24600":', JSON.stringify(await simulateRoute("PA24600"), null, 2));
  console.log('Query "PA24125":', JSON.stringify(await simulateRoute("PA24125"), null, 2));
}

main();
