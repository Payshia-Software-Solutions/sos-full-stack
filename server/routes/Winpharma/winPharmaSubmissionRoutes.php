<?php
// routes/Winpharma/winPharmaSubmissionRoutes.php

require_once './controllers/Winpharma/WinPharmaSubmissionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$WinPharmaSubmissionController = new WinPharmaSubmissionController($pdo);

// Define Winpharma Submission routes
return [
    'GET /win_pharma_submission/' => function () use ($WinPharmaSubmissionController) {
        $WinPharmaSubmissionController->getWinPharmaSubmissions();
    },
    'GET /win_pharma_submission/\?courseCode=([a-zA-Z0-9_\-]+)/' => function () use ($WinPharmaSubmissionController) {
        $WinPharmaSubmissionController->getWinPharmaSubmissions();
    },
    'GET /win_pharma_submission/(\d+)/' => function ($id) use ($WinPharmaSubmissionController) {
        $WinPharmaSubmissionController->getWinPharmaSubmission($id);
    },
    'POST /win_pharma_submission/' => function () use ($WinPharmaSubmissionController) {
        $WinPharmaSubmissionController->createWinPharmaSubmission();
    },
    'POST /win_pharma_submission/(\d+)/' => function ($id) use ($WinPharmaSubmissionController) {
        $WinPharmaSubmissionController->updateWinPharmaSubmission($id);
    },
    'DELETE /win_pharma_submission/(\d+)/' => function ($id) use ($WinPharmaSubmissionController) {
        $WinPharmaSubmissionController->deleteWinPharmaSubmission($id);
    },

    // Get Levels by Course Code
    'GET /win_pharma/get-levels\?CourseCode=([a-zA-Z0-9_\-]+)/' => function ($CourseCode) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->getLevels($CourseCode);
    },

    // Get Submission Level Count
    'GET /win_pharma_submission/get-submission-level-count\?UserName=([a-zA-Z0-9_\-]+)&batchCode=([a-zA-Z0-9_\-]+)/' => function ($UserName, $batchCode) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->GetSubmissionLevelCount($UserName, $batchCode);
    },

    // Get WinPharma Results
    'GET /win_pharma_submission/get-results\?UserName=([a-zA-Z0-9_\-]+)&batchCode=([a-zA-Z0-9_\-]+)/' => function ($UserName, $batchCode) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->getWinPharmaResults($UserName, $batchCode);
    },

    // Get Submissions by filter
    'GET /win_pharma_submission/get-submissions-by-filter\?UserName=([a-zA-Z0-9_\-]+)&batchCode=([a-zA-Z0-9_\-]+)/' => function ($UserName, $batchCode) use ($WinPharmaSubmissionController) {
        return $WinPharmaSubmissionController->getWinPharmaSubmissionsByFilters($UserName, $batchCode);
    },
];
