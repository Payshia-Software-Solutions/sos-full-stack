<?php
// routes/eCertificateRoutes.php

require_once './controllers/ECertificateController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$eCertificateController = new ECertificateController($pdo);

// Define e-certificate routes
return [
    'GET /certificates/' => [$eCertificateController, 'getCertificates'],
    'GET /certificates/{id}/' => [$eCertificateController, 'getCertificate'],
    'POST /certificates/' => [$eCertificateController, 'createCertificate'],
    'PUT /certificates/{id}/' => [$eCertificateController, 'updateCertificate'],
    'DELETE /certificates/{id}/' => [$eCertificateController, 'deleteCertificate'],
    'GET /certificates/get-completion/{course_code}/{username}/' => [$eCertificateController, 'getCourseCompletion'],
    'GET /certificates/get-completion/{course_code}/{username}/{title}/' => [$eCertificateController, 'getCourseCompletionByTitle'],
];
