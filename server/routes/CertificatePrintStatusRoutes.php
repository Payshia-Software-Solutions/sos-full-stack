<?php
// routes/CertificatePrintStatusRoutes.php

require_once './controllers/CertificatePrintStatusController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new CertificatePrintStatusController($pdo);

// Define an array of routes
return [
    'GET /certificate-print-status/course/([A-Za-z0-9]+)/$' => function ($courseCode) use ($controller) {
        return $controller->getByCourseCode($courseCode);
    },
];
