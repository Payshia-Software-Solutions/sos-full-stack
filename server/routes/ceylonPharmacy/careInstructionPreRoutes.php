<?php
// server/routes/ceylonPharmacy/careInstructionPreRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareInstructionPreController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careInstructionPreController = new CareInstructionPreController($pdo);

// Define routes
return [
    // Get all care instructions
    'GET /care-instructions-pre/$' => function () use ($careInstructionPreController) {
        $careInstructionPreController->getAll();
    },
    // Get care instruction by ID
    'GET /care-instructions-pre/(\d+)/$' => function ($id) use ($careInstructionPreController) {
        $careInstructionPreController->getById($id);
    },
    // Create new care instruction
    'POST /care-instructions-pre/$' => function () use ($careInstructionPreController) {
        $careInstructionPreController->create();
    },
    // Update care instruction
    'PUT /care-instructions-pre/(\d+)/$' => function ($id) use ($careInstructionPreController) {
        $careInstructionPreController->update($id);
    },
    // Delete care instruction
    'DELETE /care-instructions-pre/(\d+)/$' => function ($id) use ($careInstructionPreController) {
        $careInstructionPreController->delete($id);
    },
];
