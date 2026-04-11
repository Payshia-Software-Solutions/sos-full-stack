<?php
// server/routes/Care/careInstructionRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareInstructionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careInstructionController = new CareInstructionController($pdo);

// Define routes
return [
    // Get all care instructions
    'GET /updated-care-instructions/$' => function () use ($careInstructionController) {
        $careInstructionController->getAll();
    },
    // Get care instruction by ID
    'GET /updated-care-instructions/(\d+)/$' => function ($id) use ($careInstructionController) {
        $careInstructionController->getById($id);
    },
    // Get care instructions by prescription code and cover ID
    'GET /care-instructions/pres-code/([^/]+)/cover-id/([^/]+)/$' => function ($presCode, $coverId) use ($careInstructionController) {
        $careInstructionController->getInstructionsByPrescriptionAndCover($presCode, $coverId);
    },
    
    // Get shuffled instructions
    'GET /care-instructions/shuffled/pres-code/([^/]+)/cover-id/([^/]+)/$' => function ($presCode, $coverId) use ($careInstructionController) {
        $careInstructionController->getShuffledInstructions($presCode, $coverId);
    },
    // Create new care instruction
    'POST /updated-care-instructions/$' => function () use ($careInstructionController) {
        $careInstructionController->create();
    },
    // Update care instruction
    'PUT /updated-care-instructions/(\d+)/$' => function ($id) use ($careInstructionController) {
        $careInstructionController->update($id);
    },
    // Delete care instruction
    'DELETE /updated-care-instructions/(\d+)/$' => function ($id) use ($careInstructionController) {
        $careInstructionController->delete($id);
    },
];
