<?php
// routes/DpadRoutes.php

require_once './controllers/Dpad/DpadController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$DpadController = new DpadController($pdo);

// Define an array of routes
return [

    // Get Active Prescriptions
    'GET /d-pad/get-active-prescriptions/$' => function () use ($DpadController) {
        return $DpadController->getActivePrescriptions();
    },

    // Get Submitted Answers by User
    'GET /d-pad/get-submitted-answers\?loggedUser=[\w]+/$' => function () use ($DpadController) {
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser is required']);
            return;
        }

        return $DpadController->getSubmittedAnswers($loggedUser);
    },

    // Get Prescription Covers
    'GET /d-pad/get-prescription-covers\?prescriptionId=[\d]+/$' => function () use ($DpadController) {
        $prescriptionId = isset($_GET['prescriptionId']) ? $_GET['prescriptionId'] : null;

        if (!$prescriptionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. prescriptionId is required']);
            return;
        }

        return $DpadController->getPrescriptionCovers($prescriptionId);
    },

    // Get Overall Grade for a User
    'GET /d-pad/get-overall-grade\?loggedUser=[\w]+/$' => function () use ($DpadController) {
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser is required']);
            return;
        }

        return $DpadController->getOverallGrade($loggedUser);
    },

];
