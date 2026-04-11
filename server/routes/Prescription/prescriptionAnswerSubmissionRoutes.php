<?php
// routes/prescription/PrescriptionAnswerSubmissionRoutes.php

require_once './controllers/Prescription/PrescriptionAnswerSubmissionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$prescriptionAnswerSubmissionController = new PrescriptionAnswerSubmissionController($pdo);

// Define appointment routes
return [
    'GET /prescription_answer_submission/' => [$prescriptionAnswerSubmissionController, 'getPrescriptionAnswerSubmissions'],
    'GET /prescription_answer_submission/{id}/' => [$prescriptionAnswerSubmissionController, 'getPrescriptionAnswerSubmission'],
    'POST /prescription_answer_submission/' => [$prescriptionAnswerSubmissionController, 'createPrescriptionAnswerSubmission'],
    'PUT /prescription_answer_submission/{id}/' => [$prescriptionAnswerSubmissionController, 'updatePrescriptionAnswerSubmission'],
    'DELETE /prescription_answer_submission/{id}/' => [$prescriptionAnswerSubmissionController, 'deletePrescriptionAnswerSubmission']
];

?>