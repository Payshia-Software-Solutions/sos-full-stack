const fs = require('fs');
const filePath = 'c:/xampp/htdocs/sos-full-stack/front-web/src/app/result-view/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `        async function fetchStudentDetails() {
            try {
                setLoading(true);
                const response = await fetch(\`\${LMS_API_URL}/get-student-full-info?loggedUser=\${loggedUser}\`);
                if (!response.ok) {
                    // This will trigger notFound() if the user itself doesn't exist
                    throw new Error('Student not found');
                }
                const data: ApiResponse = await response.json();
                setStudentData(data);
            } catch (error) {
                console.error("Error fetching student details:", error);
                setStudentData(null);
            } finally {
                setLoading(false);
            }
        }`;

const replacement = `        async function fetchStudentDetails() {
            try {
                setLoading(true);
                const cleanUser = (loggedUser || '').trim().replace(/[\\/\\\\ \\-_]/g, '').toUpperCase();
                let data: ApiResponse | null = null;
                try {
                    const res = await fetch(\`/api/certificate/details?loggedUser=\${encodeURIComponent(cleanUser)}\`);
                    if (res.ok) {
                        data = await res.json();
                    }
                } catch {
                    // fallback
                }

                if (!data) {
                    const response = await fetch(\`\${LMS_API_URL}/get-student-full-info?loggedUser=\${encodeURIComponent(cleanUser)}\`);
                    if (response.ok) {
                        data = await response.json();
                    }
                }

                if (!data) {
                    throw new Error('Student not found');
                }
                setStudentData(data);
            } catch (error) {
                console.error("Error fetching student details:", error);
                setStudentData(null);
            } finally {
                setLoading(false);
            }
        }`;

// Normalize line endings for replacement
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const newContent = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully updated result-view/page.tsx');
} else {
  console.error('Target not found in result-view/page.tsx');
}
