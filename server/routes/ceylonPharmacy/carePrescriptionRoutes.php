<?php
// routes/ceylonPharmacy/carePrescriptionRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CarePrescriptionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$carePrescriptionController = new CarePrescriptionController($pdo);

// Define routes
return [
    'GET /care-prescriptions' => [$carePrescriptionController, 'getAll'],
    'GET /care-prescriptions/{id}' => [$carePrescriptionController, 'getById'],
    'POST /care-prescriptions' => [$carePrescriptionController, 'create'],
    'PUT /care-prescriptions/{id}' => [$carePrescriptionController, 'update'],
    'DELETE /care-prescriptions/{id}' => [$carePrescriptionController, 'delete']
];
