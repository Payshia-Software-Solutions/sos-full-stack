<?php
// routes/prescription/PrescriptionRoutes.php

require_once './controllers/Prescription/PrescriptionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$prescriptionController = new PrescriptionController($pdo);

// Define appointment routes
return [
    'GET /prescription/' => [$prescriptionController, 'getPrescriptions'],
    'GET /prescription/{id}/' => [$prescriptionController, 'getPrescription'],
    'POST /prescription/' => [$prescriptionController, 'createPrescription'],
    'PUT /prescription/{id}/' => [$prescriptionController, 'updatePrescription'],
    'DELETE /prescription/{id}/' => [$prescriptionController, 'deletePrescription']
];

?>