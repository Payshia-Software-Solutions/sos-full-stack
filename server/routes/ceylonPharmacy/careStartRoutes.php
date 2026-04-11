<?php
// server/routes/ceylonPharmacy/careStartRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareStartController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careStartController = new CareStartController($pdo);

// Define routes
return [
    // Get all care starts
    'GET /care-starts/$' => function () use ($careStartController) {
        $careStartController->getAll();
    },
    // Get care start by student_id and PresCode
    'GET /care-starts/student/([^/]+)/pres-code/([^/]+)/$' => function ($student_id, $PresCode) use ($careStartController) {
        $careStartController->getByStudentIdAndPresCode($student_id, $PresCode);
    },
    // Get care start by ID
    'GET /care-starts/(\d+)/$' => function ($id) use ($careStartController) {
        $careStartController->getById($id);
    },
    // Create new care start
    'POST /care-starts/$' => function () use ($careStartController) {
        $careStartController->create();
    },
    // Update care start
    'PUT /care-starts/(\d+)/$' => function ($id) use ($careStartController) {
        $careStartController->update($id);
    },
    // Delete care start
    'DELETE /care-starts/(\d+)/$' => function ($id) use ($careStartController) {
        $careStartController->delete($id);
    },
    // Update patient status
    'POST /care-starts/(\d+)/patient-status/$' => function ($id) use ($careStartController) {
        $careStartController->updatePatientStatus($id);
    },

    // Update patient status by student and patient
    'POST /care-starts/student/([^/]+)/patient/([^/]+)/patient-status/$' => function ($student_id, $patient_id) use ($careStartController) {
        $careStartController->updatePatientStatusByStudentAndPatient($student_id, $patient_id);
    }
];
