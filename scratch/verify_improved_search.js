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

async function searchStudents(q) {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const cleanTerm = trimmed.replace(/[\/\\ \-_]/g, "").toUpperCase();
  const results = [];
  const seenUsernames = new Set();

  const addItem = (item) => {
    const key = (item.username || item.id || "").toUpperCase();
    if (!key || seenUsernames.has(key)) return;
    seenUsernames.add(key);
    results.push(item);
  };

  // 1. Certificate ID (e.g. CREF4307)
  if (/^CREF/i.test(cleanTerm)) {
    try {
      const certRes = await fetchJson(`${LMS_API_URL}/certificate-print-status/by-certificate_id/${encodeURIComponent(cleanTerm)}/`);
      if (certRes.ok && certRes.data?.student_number) {
        const studentRes = await fetchJson(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(certRes.data.student_number)}`);
        if (studentRes.ok && studentRes.data?.studentInfo) {
          const s = studentRes.data.studentInfo;
          addItem({
            id: String(s.id || certRes.data.id),
            username: s.username || certRes.data.student_number,
            name_on_certificate: s.name_on_certificate || s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || certRes.data.student_number,
            student_id: s.student_id,
            certificate_id: certRes.data.certificate_id,
            course_code: certRes.data.course_code,
          });
        }
      }
    } catch (e) {}
  }

  // 2. Direct Index Number (e.g. PA24600, PA24125, PA19125, or bare digits 19125, 24600)
  const indexCandidates = [];
  if (/^[A-Z]{1,4}\d+/i.test(cleanTerm)) {
    indexCandidates.push(cleanTerm);
  } else if (/^\d{3,}$/.test(cleanTerm)) {
    // Bare digits: try with "PA" prefix first, then bare digits
    indexCandidates.push(`PA${cleanTerm}`);
    indexCandidates.push(cleanTerm);
  }

  for (const candidate of indexCandidates) {
    try {
      const studentRes = await fetchJson(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(candidate)}`);
      if (studentRes.ok && studentRes.data?.studentInfo?.username) {
        const s = studentRes.data.studentInfo;
        addItem({
          id: String(s.id),
          username: s.username,
          name_on_certificate: s.name_on_certificate || s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username,
          student_id: s.student_id,
        });
        break; // Found primary match
      }
    } catch (e) {}
  }

  // 3. Keyword / Name search via /users/search/{token}
  const searchToken = trimmed.replace(/[\/\\]/g, "").split(/\s+/)[0];
  if (searchToken.length >= 2) {
    try {
      const usersRes = await fetchJson(`${LMS_API_URL}/users/search/${encodeURIComponent(searchToken)}`);
      if (usersRes.ok && Array.isArray(usersRes.data)) {
        for (const u of usersRes.data) {
          addItem({
            id: String(u.id),
            username: u.username,
            name_on_certificate: `${u.fname || ""} ${u.lname || ""}`.trim() || u.username,
            student_id: u.userid || u.username,
          });
        }
      }
    } catch (e) {}
  }

  return results;
}

async function run() {
  const testQueries = ["19125", "PA19125", "24600", "PA24600", "PA24125", "Kasun", "Dilshan", "CREF4307"];
  for (const q of testQueries) {
    const res = await searchStudents(q);
    console.log(`\n=== Query "${q}" ===`);
    console.log(JSON.stringify(res.slice(0, 2), null, 2));
  }
}

run();
