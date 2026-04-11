<?php
// server/routes/ceylonPharmacy/CareAnswerRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careAnswerController = new CareAnswerController($pdo);

// Define routes
return [
    // Get all care answers
    'GET /care-answers/$' => function () use ($careAnswerController) {
        $careAnswerController->getAll();
    },
    // Get all distinct names
    'GET /care-answers/names/$' => function () use ($careAnswerController) {
        $careAnswerController->getDistinctNames();
    },
    // Get data for form selections
    'GET /care-answers/form-selection-data/$' => function () use ($careAnswerController) {
        $careAnswerController->getFormSelectionData();
    },
    // Get care answer by ID
    'GET /care-answers/(\d+)/$' => function ($id) use ($careAnswerController) {
        $careAnswerController->getById($id);
    },
    // Get care answers by prescription ID and cover ID
    'GET /care-answers/pres-id/([^/]+)/cover-id/([^/]+)/$' => function ($presId, $coverId) use ($careAnswerController) {
        $careAnswerController->getAnswersByPrescriptionAndCover($presId, $coverId);
    },
    // Create new care answer
    'POST /care-answers/$' => function () use ($careAnswerController) {
        $careAnswerController->create();
    },
    // Update care answer
    'PUT /care-answers/(\d+)/$' => function ($id) use ($careAnswerController) {
        $careAnswerController->update($id);
    },
    // Delete care answer
    'DELETE /care-answers/(\d+)/$' => function ($id) use ($careAnswerController) {
        $careAnswerController->delete($id);
    },
];
