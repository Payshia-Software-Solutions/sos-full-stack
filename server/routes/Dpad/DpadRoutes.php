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
        $courseCode = isset($_GET['courseCode']) ? $_GET['courseCode'] : null;

        if (!$loggedUser) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. loggedUser is required']);
            return;
        }

        return $DpadController->getOverallGrade($loggedUser, $courseCode);
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

    // Update Prescription Status Only
    'POST /d-pad/admin/update-status/$' => function () use ($DpadController) {
        return $DpadController->updateStatus();
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

    // ─── Course Assignment Routes ──────────────────────────────────────────────

    // Student: get active prescriptions filtered by course code
    'GET /d-pad/get-active-by-course/$' => function () use ($DpadController) {
        $courseCode = $_GET['courseCode'] ?? null;
        if (!$courseCode) {
            http_response_code(400);
            echo json_encode(['error' => 'courseCode is required']);
            return;
        }
        return $DpadController->getActivePrescriptionsByCourse($courseCode);
    },

    // Admin: assign a prescription to a course
    'POST /d-pad/admin/assign-to-course/$' => function () use ($DpadController) {
        return $DpadController->assignToCourse();
    },

    // Admin: remove a prescription from a course
    'POST /d-pad/admin/unassign-from-course/$' => function () use ($DpadController) {
        return $DpadController->unassignFromCourse();
    },

    // Admin: get all course codes assigned to a prescription
    'GET /d-pad/admin/prescription-courses/$' => function () use ($DpadController) {
        $prescriptionId = $_GET['prescriptionId'] ?? null;
        if (!$prescriptionId) {
            http_response_code(400);
            echo json_encode(['error' => 'prescriptionId is required']);
            return;
        }
        return $DpadController->getCoursesByPrescription($prescriptionId);
    },

    // Admin: get all assignments (for bulk assignment page)
    'GET /d-pad/admin/all-course-assignments/$' => function () use ($DpadController) {
        return $DpadController->getAllCourseAssignments();
    },

];
