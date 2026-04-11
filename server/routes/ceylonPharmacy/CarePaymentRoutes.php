<?php
// routes/ceylonPharmacy/CarePaymentRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CarePaymentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$carePaymentController = new CarePaymentController($pdo);

// Define routes
return [
    'GET /care-payments/$' => function () use ($carePaymentController) {
        $carePaymentController->getAll();
    },
    'GET /care-payments/(\d+)/$' => function ($id) use ($carePaymentController) {
        $carePaymentController->getById($id);
    },
    'POST /care-payments/$' => function () use ($carePaymentController) {
        $carePaymentController->create();
    },
    'PUT /care-payments/(\d+)/$' => function ($id) use ($carePaymentController) {
        $carePaymentController->update($id);
    },
    'DELETE /care-payments/(\d+)/$' => function ($id) use ($carePaymentController) {
        $carePaymentController->delete($id);
    },
    'GET /care-payments/last/([a-zA-Z0-9_\\-]+)/$' => function ($presCode) use ($carePaymentController) {
        $carePaymentController->getLastByPresCode($presCode);
    },
];
