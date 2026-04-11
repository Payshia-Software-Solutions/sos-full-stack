<?php
// routes/CertificationCenter/ccCriteriaListRoutes.php

require_once './controllers/CertificationCenter/CertificateVerificationController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$CertificateVerificationController = new CertificateVerificationController($pdo);

// Define an array of routes
return [
    // Define a GET route to handle the "recovered-patients" endpoint with dynamic parameters
    'GET /certificate-verification\?studentNumber=[\w]+/$' => function () use ($CertificateVerificationController) {
        // Access query parameters using $_GET
   
        $studentNumber = isset($_GET['studentNumber']) ? $_GET['studentNumber'] : null;

        // Validate parameters
        if (!$studentNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. studentNumber are must use for this API']);
            return;
        }

        return $CertificateVerificationController->GetCertificateVerification($studentNumber);
    },
];