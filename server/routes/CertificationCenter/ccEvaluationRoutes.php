<?php
// routes/CertificationCenter/ccCriteriaListRoutes.php

require_once './controllers/CertificationCenter/CcEvaluationController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$CcEvaluationController = new CcEvaluationController($pdo);

// Define an array of routes
return [
    // Define a GET route to handle the "recovered-patients" endpoint with dynamic parameters
    'GET /get-ceylon-pharmacy-recovered-count/$' => function () use ($CcEvaluationController) {
        // Access query parameters using $_GET
        $courseCode = $_GET['CourseCode'] ?? null;
        $loggedUser = $_GET['loggedUser'] ?? null;

        // Validate parameters
        if (!$courseCode || !$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. CourseCode & loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetCeylonPharmacyRecoveredCount($courseCode, $loggedUser);
    },

    'GET /get-pharma-hunter-progress/$' => function () use ($CcEvaluationController) {
        $loggedUser = $_GET['loggedUser'] ?? null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetPharmaHunterProgress($loggedUser);
    },

    'GET /get-pharma-hunter-pro-progress/$' => function () use ($CcEvaluationController) {
        $loggedUser = $_GET['loggedUser'] ?? null;
        $courseCode = $_GET['CourseCode'] ?? null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->getHunterProProgress($courseCode, $loggedUser);
    },
    'GET /get-assignments-results/$' => function () use ($CcEvaluationController) {
        $loggedUser = $_GET['loggedUser'] ?? null;
        $courseCode = $_GET['CourseCode'] ?? null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetAssignmentGrades($courseCode, $loggedUser);
    },
    'GET /get-student-balance/$' => function () use ($CcEvaluationController) {
        $loggedUser = $_GET['loggedUser'] ?? null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetStudentBalance($loggedUser);
    },
    'GET /get-certificate-evaluation/$' => function () use ($CcEvaluationController) {
        $loggedUser = $_GET['loggedUser'] ?? null;
        $courseCode = $_GET['CourseCode'] ?? null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetCertificationEvaluation($courseCode, $loggedUser);
    },
    'GET /get-student-full-info/$' => function () use ($CcEvaluationController) {
        $loggedUser = $_GET['loggedUser'] ?? null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetStudentFullDetails($loggedUser);
    },





];
