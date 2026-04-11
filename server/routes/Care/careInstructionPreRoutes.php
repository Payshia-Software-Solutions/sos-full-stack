<?php
// routes/Care/careInstructionPreRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareInstructionPreController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careInstructionPreController = new CareInstructionPreController($pdo);

// Define routes
return [
    'GET /care-instruction-pres' => [$careInstructionPreController, 'getAll'],
    'GET /care-instruction-pres/{id}' => [$careInstructionPreController, 'getById'],
    'POST /care-instruction-pres' => [$careInstructionPreController, 'create'],
    'PUT /care-instruction-pres/{id}' => [$careInstructionPreController, 'update'],
    'DELETE /care-instruction-pres/{id}' => [$careInstructionPreController, 'delete']
];
