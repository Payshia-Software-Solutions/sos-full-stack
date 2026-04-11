<?php
// routes/UserCertificatePrintStatusRoutes.php

require_once './controllers/UserCertificatePrintStatusControllerNew.php';

$pdo = $GLOBALS['pdo'];
$ucpsController = new UserCertificatePrintStatusControllerNew($pdo);

return [
    // GET all statuses
    'GET /certificate-print-status/$' => function () use ($ucpsController) {
        return $ucpsController->getAllStatuses();
    },

    // GET a single status by ID
    'GET /certificate-print-status/(\d+)/$' => function ($id) use ($ucpsController) {
        return $ucpsController->getStatusById($id);
    },

     // GET a single status by ID
    'GET /certificate-print-status/by-certificate_id/([A-Za-z0-9]+)/$' => function ($certificate_id) use ($ucpsController) {
        return $ucpsController->getStatusByCertificateId($certificate_id);
    },

    // POST create a new status
    'POST /certificate-print-status/$' => function () use ($ucpsController) {
        return $ucpsController->createStatus();
    },

    // PUT update a status
    'PUT /certificate-print-status/(\d+)/$' => function ($id) use ($ucpsController) {
        return $ucpsController->updateStatus($id);
    },

    // DELETE a status
    'DELETE /certificate-print-status/(\d+)/$' => function ($id) use ($ucpsController) {
        return $ucpsController->deleteStatus($id);
    },
    
    'GET /user-certificate-print-status/student/{studentNumber}/course/{courseCode}/type/{type}' => function($studentNumber, $courseCode, $type) use ($controller) {
        $controller->getByStudentNumberCourseCodeAndType($studentNumber, $courseCode, $type);
    },
];