<?php
require_once './controllers/UserCertificatePrintStatus/UserCertificatePrintStatusController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$userCertificatePrintStatusController = new UserCertificatePrintStatusController($pdo);

// Define routes
return [
    // Get records with various filters
    'GET /user_certificate_print_status/' => function () use ($userCertificatePrintStatusController) {
        $studentNumber = $_GET['studentNumber'] ?? null;
        $courseCode = $_GET['courseCode'] ?? null;
        $certificateId = $_GET['certificateId'] ?? null;
        $printStatus = $_GET['printStatus'] ?? null;

        if ($studentNumber && $courseCode) {
            return $userCertificatePrintStatusController->getRecordsByStudentNumberAndCourseCode($studentNumber, $courseCode);
        } elseif ($studentNumber) {
            return $userCertificatePrintStatusController->getRecordsByStudentNumber($studentNumber);
        } elseif ($certificateId) {
            return $userCertificatePrintStatusController->getRecordsByCertificateId($certificateId);
        } elseif ($printStatus) {
            return $userCertificatePrintStatusController->getRecordsByPrintStatus($printStatus);
        }

        return $userCertificatePrintStatusController->getAllRecords();
    },

    // Get a record by ID
    'GET /user_certificate_print_status/{id}/' => [$userCertificatePrintStatusController, 'getRecordById'],

    // Create a new record
    'POST /user_certificate_print_status/' => [$userCertificatePrintStatusController, 'createRecord'],

    // Update a record by ID
    'PUT /user_certificate_print_status/{id}/' => [$userCertificatePrintStatusController, 'updateRecord'],

    // Delete a record by ID
    'DELETE /user_certificate_print_status/{id}/' => [$userCertificatePrintStatusController, 'deleteRecord'],
];
