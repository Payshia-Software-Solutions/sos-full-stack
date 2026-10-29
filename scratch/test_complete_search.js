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

const LMS_API_URL = 'https://qa-api.pharmacollege.lk';

async function searchStudentHandler(q) {
  const trimmed = (q || '').trim();
  if (trimmed.length < 2) return [];

  // Normalize: remove slashes, spaces, dashes
  const cleanTerm = trimmed.replace(/[\/\\ \-_]/g, '').toUpperCase();

  // 1. Check if Certificate Reference (starts with CREF or similar)
  if (/^CREF/i.test(cleanTerm)) {
    const certRecord = await fetchJson(`${LMS_API_URL}/certificate-print-status/by-certificate_id/${encodeURIComponent(cleanTerm)}/`);
    if (certRecord && certRecord.student_number) {
      const studentData = await fetchJson(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(certRecord.student_number)}`);
      if (studentData && studentData.studentInfo) {
        const s = studentData.studentInfo;
        return [{
          id: String(s.id),
          username: s.username,
          name_on_certificate: s.name_on_certificate || s.full_name || `${s.first_name} ${s.last_name}`.trim(),
          student_id: s.student_id,
          certificate_id: certRecord.certificate_id,
          course_code: certRecord.course_code
        }];
      }
    }
  }

  // 2. Check if Index Number format (e.g. PA24600, PA/24/600, or any prefix + digits)
  if (/^[A-Z]{1,4}\d+/i.test(cleanTerm) || /^\d{3,}$/.test(cleanTerm)) {
    // Try exact index in get-student-full-info
    const studentData = await fetchJson(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanTerm)}`);
    if (studentData && studentData.studentInfo && studentData.studentInfo.username) {
      const s = studentData.studentInfo;
      return [{
        id: String(s.id),
        username: s.username,
        name_on_certificate: s.name_on_certificate || s.full_name || `${s.first_name} ${s.last_name}`.trim(),
        student_id: s.student_id
      }];
    }
  }

  // 3. Name or Keyword search via /users/search/{token}
  const searchToken = trimmed.replace(/[\/\\]/g, '').split(/\s+/)[0];
  if (searchToken.length >= 2) {
    const users = await fetchJson(`${LMS_API_URL}/users/search/${encodeURIComponent(searchToken)}`);
    if (Array.isArray(users) && users.length > 0) {
      return users.map(u => ({
        id: String(u.id),
        username: u.username,
        name_on_certificate: `${u.fname || ''} ${u.lname || ''}`.trim() || u.username,
        student_id: u.userid || u.username
      }));
    }
  }

  return [];
}

async function run() {
  const tests = ['PA24600', 'PA/24/600', 'pa24600', 'CREF4307', 'Hansi', 'Kasun'];
  for (const t of tests) {
    const res = await searchStudentHandler(t);
    console.log(`[Query: "${t}"] => Results count: ${res.length}`, res[0]);
  }
}

run();
