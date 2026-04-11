<?php
// server/routes/ceylonPharmacy/CareCenterRecoveryRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareCenterRecoveryController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careCenterRecoveryController = new CareCenterRecoveryController($pdo);

// Define routes
return [
    'GET /care-center-recoveries/$' => function () use ($careCenterRecoveryController) {
        $careCenterRecoveryController->getAll();
    },
    'GET /care-center-recoveries/(\d+)/$' => function ($id) use ($careCenterRecoveryController) {
        $careCenterRecoveryController->getById($id);
    },
    'GET /care-center-recoveries/student/([^/]+)/$' => function ($studentNumber) use ($careCenterRecoveryController) {
        $careCenterRecoveryController->getByStudentNumber($studentNumber);
    },
    'POST /care-center-recoveries/$' => function () use ($careCenterRecoveryController) {
        $careCenterRecoveryController->create();
    },
    'PUT /care-center-recoveries/(\d+)/$' => function ($id) use ($careCenterRecoveryController) {
        $careCenterRecoveryController->update($id);
    },
    'DELETE /care-center-recoveries/(\d+)/$' => function ($id) use ($careCenterRecoveryController) {
        $careCenterRecoveryController->delete($id);
    },
];
