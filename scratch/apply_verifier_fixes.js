const fs = require('fs');

// --- 1. Update front-web/src/components/certificate-verifier.tsx ---
const verifierPath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier.tsx';
let verifierContent = fs.readFileSync(verifierPath, 'utf8').replace(/\r\n/g, '\n');

// Update import to include useRef
verifierContent = verifierContent.replace(
  'import { useState, useEffect, useCallback, useMemo } from "react";',
  'import { useState, useEffect, useCallback, useMemo, useRef } from "react";'
);

// Replace Main Verifier Component state and performSearch
const oldVerifierSection = `// --- Main Verifier Component ---
export default function CertificateVerifier() {
  const [query, setQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const [view, setView] = useState<'search' | 'enrollments' | 'details'>('search');
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setFilteredStudents([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      // Query Next.js internal search API with resilient multi-strategy resolution
      const response = await fetch(\`/api/certificate/search?q=\${encodeURIComponent(trimmed)}\`);
      if (response.ok) {
        const data: StudentSearchResult[] = await response.json();
        setFilteredStudents(Array.isArray(data) ? data : []);
      } else {
        // Fallback directly to LMS
        const cleanUser = trimmed.replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
        const fallbackRes = await fetch(\`\${LMS_API_URL}/get-student-full-info?loggedUser=\${encodeURIComponent(cleanUser)}\`);
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          if (fbData?.studentInfo?.username) {
            const s = fbData.studentInfo;
            setFilteredStudents([{
              id: String(s.id),
              username: s.username,
              name_on_certificate: s.name_on_certificate || s.full_name || \`\${s.first_name} \${s.last_name}\`,
              student_id: s.student_id,
            }]);
            return;
          }
        }
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Certificate search error:", error);
      setFilteredStudents([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);`;

const newVerifierSection = `// --- Main Verifier Component ---
export default function CertificateVerifier() {
  const [query, setQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const latestQueryRef = useRef(query);
  latestQueryRef.current = query;

  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const [view, setView] = useState<'search' | 'enrollments' | 'details'>('search');
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      if (latestQueryRef.current.trim().length < 2) {
        setFilteredStudents([]);
        setSearchLoading(false);
      }
      return;
    }

    try {
      setSearchLoading(true);
      // Query Next.js internal search API with resilient multi-strategy resolution
      const response = await fetch(\`/api/certificate/search?q=\${encodeURIComponent(trimmed)}\`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data: StudentSearchResult[] = await response.json();
        // Guard against race condition: only update if query hasn't changed
        if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
          setFilteredStudents(Array.isArray(data) ? data : []);
        }
      } else {
        // Fallback directly to LMS
        const cleanTerm = trimmed.replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
        const candidateUsers = [cleanTerm];
        if (/^\\d{3,}$/.test(cleanTerm)) {
          candidateUsers.unshift(\`PA\${cleanTerm}\`);
        }
        let found = false;
        for (const user of candidateUsers) {
          try {
            const fallbackRes = await fetch(\`\${LMS_API_URL}/get-student-full-info?loggedUser=\${encodeURIComponent(user)}\`, {
              cache: 'no-store',
            });
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              if (fbData?.studentInfo?.username) {
                const s = fbData.studentInfo;
                if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
                  setFilteredStudents([{
                    id: String(s.id),
                    username: s.username,
                    name_on_certificate: s.name_on_certificate || s.full_name || \`\${s.first_name || ''} \${s.last_name || ''}\`.trim() || s.username,
                    student_id: s.student_id,
                  }]);
                }
                found = true;
                break;
              }
            }
          } catch {}
        }
        if (!found && searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
          setFilteredStudents([]);
        }
      }
    } catch (error) {
      console.error("Certificate search error:", error);
      if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
        setFilteredStudents([]);
      }
    } finally {
      if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
        setSearchLoading(false);
      }
    }
  }, []);`;

if (verifierContent.includes(oldVerifierSection)) {
  verifierContent = verifierContent.replace(oldVerifierSection, newVerifierSection);
  console.log('Successfully updated performSearch in certificate-verifier.tsx');
} else {
  console.error('Could not find oldVerifierSection in certificate-verifier.tsx');
}

// Update handleStudentSelect in certificate-verifier.tsx
verifierContent = verifierContent.replace(
  `        const cleanUser = student.username.trim().replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();`,
  `        let cleanUser = student.username.trim().replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
        if (/^\\d{3,}$/.test(cleanUser)) {
          cleanUser = \`PA\${cleanUser}\`;
        }`
);

fs.writeFileSync(verifierPath, verifierContent, 'utf8');

// --- 2. Update front-web/src/components/certificate-verifier-home.tsx ---
const homePath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/components/certificate-verifier-home.tsx';
let homeContent = fs.readFileSync(homePath, 'utf8').replace(/\r\n/g, '\n');

homeContent = homeContent.replace(
  'import { useState, useEffect, useCallback, useMemo } from "react";',
  'import { useState, useEffect, useCallback, useMemo, useRef } from "react";'
);

const oldHomeState = `  const [query, setQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setFilteredStudents([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      // Query Next.js internal search API with multi-strategy resolution
      const response = await fetch(\`/api/certificate/search?q=\${encodeURIComponent(trimmed)}\`);
      if (response.ok) {
        const data: StudentSearchResult[] = await response.json();
        setFilteredStudents(Array.isArray(data) ? data : []);
      } else {
        // Fallback directly to LMS
        const cleanUser = trimmed.replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
        const fallbackRes = await fetch(\`\${LMS_API_URL}/get-student-full-info?loggedUser=\${encodeURIComponent(cleanUser)}\`);
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          if (fbData?.studentInfo?.username) {
            const s = fbData.studentInfo;
            setFilteredStudents([{
              id: String(s.id),
              username: s.username,
              name_on_certificate: s.name_on_certificate || s.full_name || \`\${s.first_name} \${s.last_name}\`,
              student_id: s.student_id,
            }]);
            return;
          }
        }
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Certificate search error:", error);
      setFilteredStudents([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);`;

const newHomeState = `  const [query, setQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const latestQueryRef = useRef(query);
  latestQueryRef.current = query;

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      if (latestQueryRef.current.trim().length < 2) {
        setFilteredStudents([]);
        setSearchLoading(false);
      }
      return;
    }

    try {
      setSearchLoading(true);
      // Query Next.js internal search API with multi-strategy resolution
      const response = await fetch(\`/api/certificate/search?q=\${encodeURIComponent(trimmed)}\`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data: StudentSearchResult[] = await response.json();
        // Guard against race condition: only update if query hasn't changed
        if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
          setFilteredStudents(Array.isArray(data) ? data : []);
        }
      } else {
        // Fallback directly to LMS
        const cleanTerm = trimmed.replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
        const candidateUsers = [cleanTerm];
        if (/^\\d{3,}$/.test(cleanTerm)) {
          candidateUsers.unshift(\`PA\${cleanTerm}\`);
        }
        let found = false;
        for (const user of candidateUsers) {
          try {
            const fallbackRes = await fetch(\`\${LMS_API_URL}/get-student-full-info?loggedUser=\${encodeURIComponent(user)}\`, {
              cache: 'no-store',
            });
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              if (fbData?.studentInfo?.username) {
                const s = fbData.studentInfo;
                if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
                  setFilteredStudents([{
                    id: String(s.id),
                    username: s.username,
                    name_on_certificate: s.name_on_certificate || s.full_name || \`\${s.first_name || ''} \${s.last_name || ''}\`.trim() || s.username,
                    student_id: s.student_id,
                  }]);
                }
                found = true;
                break;
              }
            }
          } catch {}
        }
        if (!found && searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
          setFilteredStudents([]);
        }
      }
    } catch (error) {
      console.error("Certificate search error:", error);
      if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
        setFilteredStudents([]);
      }
    } finally {
      if (searchQuery.trim().toUpperCase() === latestQueryRef.current.trim().toUpperCase()) {
        setSearchLoading(false);
      }
    }
  }, []);`;

if (homeContent.includes(oldHomeState)) {
  homeContent = homeContent.replace(oldHomeState, newHomeState);
  console.log('Successfully updated performSearch in certificate-verifier-home.tsx');
} else {
  console.error('Could not find oldHomeState in certificate-verifier-home.tsx');
}

// Update handleStudentSelect in certificate-verifier-home.tsx
homeContent = homeContent.replace(
  `      const cleanUser = student.username.trim().replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();`,
  `      let cleanUser = student.username.trim().replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
      if (/^\\d{3,}$/.test(cleanUser)) {
        cleanUser = \`PA\${cleanUser}\`;
      }`
);

fs.writeFileSync(homePath, homeContent, 'utf8');
