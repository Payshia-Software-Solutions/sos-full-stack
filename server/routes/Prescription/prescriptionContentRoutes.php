<?php
// routes/prescription/PrescriptionContentRoutes.php

require_once './controllers/Prescription/PrescriptionContentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$prescriptionContentController = new PrescriptionContentController($pdo);

// Define appointment routes
return [
    'GET /prescription_content/' => [$prescriptionContentController, 'getPrescriptionContents'],
    'GET /prescription_content/{id}/' => [$prescriptionContentController, 'getPrescriptionContent'],
    'POST /prescription_content/' => [$prescriptionContentController, 'createPrescriptionContent'],
    'PUT /prescription_content/{id}/' => [$prescriptionContentController, 'updatePrescriptionContent'],
    'DELETE /prescription_content/{id}/' => [$prescriptionContentController, 'deletePrescriptionContent']
];

?>