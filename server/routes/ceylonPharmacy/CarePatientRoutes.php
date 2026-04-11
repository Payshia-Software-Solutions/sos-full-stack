<?php
// routes/ceylonPharmacy/CarePatientRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CarePatientController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$carePatientController = new CarePatientController($pdo);

// Define routes
return [
    'GET /care-patients/$' => function () use ($carePatientController) {
        $carePatientController->getAll();
    },
    'GET /care-patients/([a-zA-Z0-9_\\-]+)/$' => function ($id) use ($carePatientController) {
        $carePatientController->getById($id);
    },
    'POST /care-patients/$' => function () use ($carePatientController) {
        $carePatientController->create();
    },
    'PUT /care-patients/([a-zA-Z0-9_\\-]+)/$' => function ($id) use ($carePatientController) {
        $carePatientController->update($id);
    },
    'DELETE /care-patients/([a-zA-Z0-9_\\-]+)/$' => function ($id) use ($carePatientController) {
        $carePatientController->delete($id);
    },
];
