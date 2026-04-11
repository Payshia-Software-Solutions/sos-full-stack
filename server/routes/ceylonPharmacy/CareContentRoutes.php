<?php
// server/routes/ceylonPharmacy/CareContentRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareContentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careContentController = new CareContentController($pdo);

// Define routes
return [
    // Get all care contents
    'GET /care-content/$' => function () use ($careContentController) {
        $careContentController->getAll();
    },
    // Get care content by ID
    'GET /care-content/(\d+)/$' => function ($id) use ($careContentController) {
        $careContentController->getById($id);
    },
    // Create new care content
    'POST /care-content/$' => function () use ($careContentController) {
        $careContentController->create();
    },
    // Update care content by prescription code and cover ID
    'POST /care-content/([^/]+)/([^/]+)/$' => function ($presCode, $coverId) use ($careContentController) {
        $careContentController->updateByPresCodeAndCoverId($presCode, $coverId);
    },
    // Delete care content
    'DELETE /care-content/(\d+)/$' => function ($id) use ($careContentController) {
        $careContentController->delete($id);
    },
    // Get care content by prescription code
    'GET /care-content/pres-code/([^/]+)/$' => function ($presCode) use ($careContentController) {
        $careContentController->getByPresCode($presCode);
    },
    // Delete care content by prescription code and cover ID
    'DELETE /care-content/([^/]+)/([^/]+)/$' => function ($presCode, $coverId) use ($careContentController) {
        $careContentController->deleteByPresCodeAndCoverId($presCode, $coverId);
    },
];
