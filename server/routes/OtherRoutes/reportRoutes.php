<?php
// routes/userRoutes.php

require_once './controllers/ReportsController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$reportsController = new ReportsController($pdo);

// Define user routes
return [
    'GET /users/{username}' => [$reportsController, 'getUserInfo'],
    'GET /reports/student-contacts/{batch_id}' => [$reportsController, 'getStudentContactsByBatch'],
    'GET /reports/game/winpharma/{batch_id}' => [$reportsController, 'getWinPharmaReport'],
    'GET /reports/game/d-pad/{batch_id}' => [$reportsController, 'getDpadReport'],
    'GET /reports/game/dpad/{batch_id}' => [$reportsController, 'getDpadReport'],
    'GET /reports/game/quiz/{batch_id}' => [$reportsController, 'getQuizReport'],
    'GET /reports/game/quiz-report/{batch_id}' => [$reportsController, 'getQuizReport'],
    'GET /reports/game/pharma-hunter/{batch_id}' => [$reportsController, 'getPharmaHunterReport'],
    'GET /reports/game/hunter/{batch_id}' => [$reportsController, 'getPharmaHunterReport'],
    'GET /reports/game/pharma-hunter-pro/{batch_id}' => [$reportsController, 'getPharmaHunterProReport'],
    'GET /reports/game/hunter-pro/{batch_id}' => [$reportsController, 'getPharmaHunterProReport'],
    'GET /reports/game/course-assignment/{batch_id}' => [$reportsController, 'getCourseAssignmentReport'],
    'GET /reports/game/course_assignment/{batch_id}' => [$reportsController, 'getCourseAssignmentReport'],
    'GET /reports/game/ceylon-pharmacy/{batch_id}' => [$reportsController, 'getCeylonPharmacyReport'],
    'GET /reports/game/ceylon_pharmacy/{batch_id}' => [$reportsController, 'getCeylonPharmacyReport'],
    'GET /reports/game/pharma-reader/{batch_id}' => [$reportsController, 'getPharmaReaderReport'],
    'GET /reports/game/pharma_reader/{batch_id}' => [$reportsController, 'getPharmaReaderReport'],
    'GET /reports/game/assignment/{batch_id}' => [$reportsController, 'getAssignmentReport'],
    'POST /reports/grading/save' => [$reportsController, 'saveAssignmentGrade'],
    'POST /reports/game/assignment/grade' => [$reportsController, 'saveAssignmentGrade'],
];

