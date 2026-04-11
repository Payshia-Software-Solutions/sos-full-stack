<?php
require_once './controllers/ecertificates/ECertificateController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$eCertificateController = new ECertificateController($pdo);

// Define routes
return [
    // Retrieve all certificates
    'GET /ecertificates' => [$eCertificateController, 'getAllCertificates'],

    // Retrieve a certificate by ID
    'GET /ecertificates/{id}' => [$eCertificateController, 'getCertificateById'],

    // Retrieve certificates by student number
    'GET /ecertificates/student/{student_number}' => [$eCertificateController, 'getCertificatesByStudentNumber'],

    // Retrieve certificates by course code
    'GET /ecertificates/course/{course_code}' => [$eCertificateController, 'getCertificatesByCourseCode'],

    // Retrieve certificates by student number and course code
'GET /ecertificate-verification\?studentNumber=[\w]+&courseCode=[\w]+/$' => function () use ($eCertificateController) {
    // Access query parameters using $_GET
    $studentNumber = isset($_GET['studentNumber']) ? $_GET['studentNumber'] : null;
    $courseCode = isset($_GET['courseCode']) ? $_GET['courseCode'] : null;

    // Validate parameters
    if (!$studentNumber || !$courseCode) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters. Both studentNumber and courseCode are required for this API']);
        return;
    }

    // Call the controller method to handle the request
    return $eCertificateController->getCertificatesByStudentNumberAndCourseCode($studentNumber, $courseCode);
},




    // Create a new certificate
    'POST /ecertificates' => [$eCertificateController, 'createCertificate'],

    // Update a certificate by ID
    'PUT /ecertificates/{id}' => [$eCertificateController, 'updateCertificate'],

    // Delete a certificate by ID
    'DELETE /ecertificates/{id}' => [$eCertificateController, 'deleteCertificate'],
];
