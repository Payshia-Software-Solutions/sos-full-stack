<?php
require_once __DIR__ . '/../controllers/CertificateTemplateController.php';

$certificateTemplateController = new CertificateTemplateController();

return [
    // Pre-prefixed /api/ routes
    'GET /api/certificate-templates/{course_code}' => function($courseCode) use ($certificateTemplateController) {
        $certificateTemplateController->getTemplate($courseCode);
    },
    'POST /api/certificate-templates' => function() use ($certificateTemplateController) {
        $certificateTemplateController->saveTemplate();
    },
    
    // Non-prefixed fallback routes for localhost config flexibility
    'GET /certificate-templates/{course_code}' => function($courseCode) use ($certificateTemplateController) {
        $certificateTemplateController->getTemplate($courseCode);
    },
    'POST /certificate-templates' => function() use ($certificateTemplateController) {
        $certificateTemplateController->saveTemplate();
    }
];
