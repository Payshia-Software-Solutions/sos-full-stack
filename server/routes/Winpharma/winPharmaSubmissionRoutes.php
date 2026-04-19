<?php
// routes/Winpharma/winPharmaSubmissionRoutes.php

require_once './controllers/Winpharma/WinPharmaSubmissionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$WinPharmaSubmissionController = new WinPharmaSubmissionController($pdo);

// Define Winpharma Submission routes
return [
    'GET /win_pharma_submission/' => function () use ($WinPharmaSubmissionController) {
        $courseCode = $_GET['courseCode'] ?? null;
        if ($courseCode) {
            // Filter by course code if provided (the controller might need updating to accept this, 
            // but for now I'll just call the same method as before since that's what the old code did)
            return $WinPharmaSubmissionController->getWinPharmaSubmissions();
        }
        return $WinPharmaSubmissionController->getWinPharmaSubmissions();
    },

    'GET /win_pharma_submission/(\d+)/' => function ($id) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->getWinPharmaSubmission($id);
    },

    'POST /win_pharma_submission/' => function () use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->createWinPharmaSubmission();
    },

    'POST /win_pharma_submission/(\d+)/' => function ($id) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->updateWinPharmaSubmission($id);
    },

    'DELETE /win_pharma_submission/(\d+)/' => function ($id) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->deleteWinPharmaSubmission($id);
    },

    // Get Levels by Course Code
    'GET /win_pharma/get-levels/' => function () use ($WinPharmaSubmissionController) {
        $CourseCode = $_GET['CourseCode'] ?? null;
        return $WinPharmaSubmissionController->getLevels($CourseCode);
    },

    // Get Submission Level Count
    'GET /win_pharma_submission/get-submission-level-count/' => function () use ($WinPharmaSubmissionController) {
        $UserName = $_GET['UserName'] ?? null;
        $batchCode = $_GET['batchCode'] ?? null;
        return $WinPharmaSubmissionController->GetSubmissionLevelCount($UserName, $batchCode);
    },

    // Get WinPharma Results
    'GET /win_pharma_submission/get-results/' => function () use ($WinPharmaSubmissionController) {
        $UserName = $_GET['UserName'] ?? null;
        $batchCode = $_GET['batchCode'] ?? null;
        return $WinPharmaSubmissionController->getWinPharmaResults($UserName, $batchCode);
    },

    // Get Submissions by filter
    'GET /win_pharma_submission/get-submissions-by-filter/' => function () use ($WinPharmaSubmissionController) {
        $UserName = $_GET['UserName'] ?? null;
        $batchCode = $_GET['batchCode'] ?? null;
        return $WinPharmaSubmissionController->getWinPharmaSubmissionsByFilters($UserName, $batchCode);
    },

    // Get Grader Performance report
    'GET /win_pharma_submission/performance/' => function () use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->getGraderPerformance();
    },
];
