<?php
require_once './controllers/UserCertificatePrintStatus/UserCertificatePrintStatusController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$userCertificatePrintStatusController = new UserCertificatePrintStatusController($pdo);

// Define routes
return [
    // Get all records
    'GET /user_certificate_print_status/' => [$userCertificatePrintStatusController, 'getAllRecords'],

    // Get a record by ID
    'GET /user_certificate_print_status/{id}/' => [$userCertificatePrintStatusController, 'getRecordById'],

    // Get records by Student Number
    'GET /user_certificate_print_status\?studentNumber=[\w]+/$' => function () use ($userCertificatePrintStatusController) {
        $studentNumber = $_GET['studentNumber'] ?? null;

        if (!$studentNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter: studentNumber']);
            return;
        }

        $userCertificatePrintStatusController->getRecordsByStudentNumber($studentNumber);
    },

    // Get records by Student Number
    'GET /user_certificate_print_status\?studentNumber=[\w]+&courseCode=[\w]+/$' => function () use ($userCertificatePrintStatusController) {
        $studentNumber = $_GET['studentNumber'] ?? null;
        $courseCode = $_GET['courseCode'] ?? null;

        // Validate both parameters
        if (!$studentNumber || !$courseCode) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters: studentNumber and courseCode are required']);
            return;
        }

        $userCertificatePrintStatusController->getRecordsByStudentNumberAndCourseCode($studentNumber, $courseCode);
    },


    // Get records by Certificate ID
    'GET /user_certificate_print_status\?certificateId=[\w]+/$' => function () use ($userCertificatePrintStatusController) {
        $certificateId = $_GET['certificateId'] ?? null;

        if (!$certificateId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter: certificateId']);
            return;
        }

        $userCertificatePrintStatusController->getRecordsByCertificateId($certificateId);
    },

    // Get records by Print Status
    'GET /user_certificate_print_status\?printStatus=[\w]+/$' => function () use ($userCertificatePrintStatusController) {
        $printStatus = $_GET['printStatus'] ?? null;

        if (!$printStatus) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter: printStatus']);
            return;
        }

        $userCertificatePrintStatusController->getRecordsByPrintStatus($printStatus);
    },

    // Create a new record
    'POST /user_certificate_print_status/' => [$userCertificatePrintStatusController, 'createRecord'],

    // Update a record by ID
    'PUT /user_certificate_print_status/{id}/' => [$userCertificatePrintStatusController, 'updateRecord'],

    // Delete a record by ID
    'DELETE /user_certificate_print_status/{id}/' => [$userCertificatePrintStatusController, 'deleteRecord'],
];
