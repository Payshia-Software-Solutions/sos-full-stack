<?php
// routes/Care/careInstructionRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareInstructionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careInstructionController = new CareInstructionController($pdo);

// Define routes
return [
    'GET /care-instructions' => [$careInstructionController, 'getAll'],
    'GET /care-instructions/{id}' => [$careInstructionController, 'getById'],
    'POST /care-instructions' => [$careInstructionController, 'create'],
    'PUT /care-instructions/{id}' => [$careInstructionController, 'update'],
    'DELETE /care-instructions/{id}' => [$careInstructionController, 'delete']
];
