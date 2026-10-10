<?php
require_once __DIR__ . '/../controllers/TranscriptTemplateController.php';

$transcriptTemplateController = new TranscriptTemplateController();

return [
    // Pre-prefixed /api/ routes
    'GET /api/transcript-templates/{course_id}' => function($courseId) use ($transcriptTemplateController) {
        $transcriptTemplateController->getTemplate($courseId);
    },
    'POST /api/transcript-templates' => function() use ($transcriptTemplateController) {
        $transcriptTemplateController->saveTemplate();
    },
    'GET /api/transcript-templates/{course_id}/print/{student_number}' => function($courseId, $studentNumber) use ($transcriptTemplateController) {
        $transcriptTemplateController->printTranscript($courseId, $studentNumber);
    },

    // Non-prefixed fallback routes for localhost config flexibility
    'GET /transcript-templates/{course_id}' => function($courseId) use ($transcriptTemplateController) {
        $transcriptTemplateController->getTemplate($courseId);
    },
    'POST /transcript-templates' => function() use ($transcriptTemplateController) {
        $transcriptTemplateController->saveTemplate();
    },
    'GET /transcript-templates/{course_id}/print/{student_number}' => function($courseId, $studentNumber) use ($transcriptTemplateController) {
        $transcriptTemplateController->printTranscript($courseId, $studentNumber);
    }
];
