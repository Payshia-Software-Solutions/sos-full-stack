import { LMS_API_URL } from '@/lib/config';

export async function getTranscriptTemplate(courseId: string) {
    const res = await fetch(`${LMS_API_URL}/transcript-templates/${courseId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch transcript template');
    }
    return res.json();
}

export async function saveTranscriptTemplate(courseId: string, templateData: any) {
    const res = await fetch(`${LMS_API_URL}/transcript-templates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            course_id: courseId,
            template_data: templateData,
        }),
    });
    if (!res.ok) {
        throw new Error('Failed to save transcript template');
    }
    return res.json();
}
