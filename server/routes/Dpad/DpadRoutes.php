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
    'GET /d-pad/get-submitted-answers/$' => function () use ($DpadController) {
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser is required']);
            return;
        }

        return $DpadController->getSubmittedAnswers($loggedUser);
    },

    // Get Prescription Covers
    'GET /d-pad/get-prescription-covers/$' => function () use ($DpadController) {
        $prescriptionId = isset($_GET['prescriptionId']) ? $_GET['prescriptionId'] : null;

        if (!$prescriptionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. prescriptionId is required']);
            return;
        }

        return $DpadController->getPrescriptionCovers($prescriptionId);
    },

    // Get Prescription Details
    'GET /d-pad/prescription-details/$' => function () use ($DpadController) {
        $prescriptionId = isset($_GET['prescriptionId']) ? $_GET['prescriptionId'] : null;

        if (!$prescriptionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. prescriptionId is required']);
            return;
        }

        return $DpadController->getPrescriptionDetails($prescriptionId);
    },

    // Submit Answer for Dpad Cover
    'POST /d-pad/submit-answer/$' => function () use ($DpadController) {
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser is required']);
            return;
        }

        return $DpadController->submitAnswer($loggedUser);
    },

    // Get Overall Grade for a User
    'GET /d-pad/get-overall-grade/$' => function () use ($DpadController) {
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser is required']);
            return;
        }

        return $DpadController->getOverallGrade($loggedUser);
    },

    // --- ADMIN ROUTES ---

    // Get All Prescriptions
    'GET /d-pad/admin/get-all-prescriptions/$' => function () use ($DpadController) {
        return $DpadController->getAllPrescriptions();
    },

    // Save/Update Prescription
    'POST /d-pad/admin/save-prescription/$' => function () use ($DpadController) {
        return $DpadController->savePrescription();
    },

    // Save/Update Answer Key
    'POST /d-pad/admin/save-answer-key/$' => function () use ($DpadController) {
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : 'Admin';
        return $DpadController->saveAnswerKey($loggedUser);
    },

    // Get Configured Answer Key
    'GET /d-pad/admin/get-answer-key/$' => function () use ($DpadController) {
        $prescriptionId = isset($_GET['prescriptionId']) ? $_GET['prescriptionId'] : null;
        $coverId = isset($_GET['coverId']) ? $_GET['coverId'] : null;

        if (!$prescriptionId || !$coverId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters: prescriptionId and coverId are required']);
            return;
        }

        return $DpadController->getAnswerKey($prescriptionId, $coverId);
    },

];
