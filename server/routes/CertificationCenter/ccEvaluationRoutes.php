<?php
// routes/CertificationCenter/ccCriteriaListRoutes.php

require_once './controllers/CertificationCenter/CcEvaluationController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$CcEvaluationController = new CcEvaluationController($pdo);

// Define an array of routes
return [
    // Define a GET route to handle the "recovered-patients" endpoint with dynamic parameters
    'GET /get-ceylon-pharmacy-recovered-count\?CourseCode=[\w]+&loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {
        // Access query parameters using $_GET
        $courseCode = isset($_GET['CourseCode']) ? $_GET['CourseCode'] : null;
        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        // Validate parameters
        if (!$courseCode || !$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. CourseCode & loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetCeylonPharmacyRecoveredCount($courseCode, $loggedUser);
    },

    'GET /get-pharma-hunter-progress\?loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {

        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetPharmaHunterProgress($loggedUser);
    },

    'GET /get-pharma-hunter-pro-progress\?CourseCode=[\w]+&loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {

        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;
        $courseCode = isset($_GET['CourseCode']) ? $_GET['CourseCode'] : null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->getHunterProProgress($courseCode, $loggedUser);
    },
    'GET /get-assignments-results\?CourseCode=[\w]+&loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {

        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;
        $courseCode = isset($_GET['CourseCode']) ? $_GET['CourseCode'] : null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetAssignmentGrades($courseCode, $loggedUser);
    },
    'GET /get-student-balance\?loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {

        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetStudentBalance($loggedUser);
    },
    'GET /get-certificate-evaluation\?CourseCode=[\w]+&loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {

        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;
        $courseCode = isset($_GET['CourseCode']) ? $_GET['CourseCode'] : null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetCertificationEvaluation($courseCode, $loggedUser);
    },
    'GET /get-student-full-info\?loggedUser=[\w]+/$' => function () use ($CcEvaluationController) {

        $loggedUser = isset($_GET['loggedUser']) ? $_GET['loggedUser'] : null;

        // Validate parameters
        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser are must use for this API']);
            return;
        }

        return $CcEvaluationController->GetStudentFullDetails($loggedUser);
    },





];
