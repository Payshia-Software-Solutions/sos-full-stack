<?php
// routes/Prescription/prescriptionAnswerRoutes.php

require_once './controllers/Prescription/PrescriptionAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$prescriptionAnswerController = new PrescriptionAnswerController($pdo);

// Define appointment routes
return [
    'GET /prescription_answer/' => [$prescriptionAnswerController, 'getPrescriptionAnswers'],
    'GET /prescription_answer/{id}/' => [$prescriptionAnswerController, 'getPrescriptionAnswer'],
    'POST /prescription_answer/' => [$prescriptionAnswerController, 'createPrescriptionAnswer'],
    'PUT /prescription_answer/{id}/' => [$prescriptionAnswerController, 'updatePrescriptionAnswer'],
    'DELETE /prescription_answer/{id}/' => [$prescriptionAnswerController, 'deletePrescriptionAnswer']
];

?>