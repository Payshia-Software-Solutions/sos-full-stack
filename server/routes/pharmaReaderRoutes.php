<?php

require_once './controllers/PharmaReaderController.php';

$pdo = $GLOBALS['pdo'];
$controller = new PharmaReaderController($pdo);

return [
    // Get all prescriptions (admin list)
    'GET /pharma-reader/prescriptions/$' => function () use ($controller) {
        return $controller->getAllPrescriptions();
    },

    // Get a prescription by ID
    'GET /pharma-reader/prescriptions/(\d+)/$' => function ($id) use ($controller) {
        return $controller->getPrescriptionById($id);
    },

    // Get a random unanswered prescription for a student
    'GET /pharma-reader/prescription/random/([a-zA-Z0-9_\-\/]+)/$' => function ($userId) use ($controller) {
        return $controller->getRandomUnansweredPrescription($userId);
    },

    // Create a new prescription
    'POST /pharma-reader/prescription/$' => function () use ($controller) {
        return $controller->createPrescription();
    },

    // Update a prescription by ID
    'PUT /pharma-reader/prescription/(\d+)/$' => function ($id) use ($controller) {
        return $controller->updatePrescription($id);
    },

    // Delete a prescription by ID
    'DELETE /pharma-reader/prescription/(\d+)/$' => function ($id) use ($controller) {
        return $controller->deletePrescription($id);
    },

    // Submit a student answer attempt
    'POST /pharma-reader/attempt/$' => function () use ($controller) {
        return $controller->submitAttempt();
    },

    // Get student grades
    'GET /pharma-reader/grades/([a-zA-Z0-9_\-\/]+)/$' => function ($userId) use ($controller) {
        return $controller->getUserGrades($userId);
    },

    // Upload prescription image
    'POST /pharma-reader/upload-image/$' => function () use ($controller) {
        return $controller->uploadImage();
    }
];
