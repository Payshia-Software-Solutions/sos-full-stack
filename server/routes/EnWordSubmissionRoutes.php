<?php
// routes/EnWordSubmissionRoutes.php

require_once './controllers/EnWordSubmissionController.php';

$pdo = $GLOBALS['pdo'];
$controller = new EnWordSubmissionController($pdo);

return [
    // GET all
    'GET /en-word-submissions/$' => fn() => $controller->getSubmissions(),

    // GET by ID
    'GET /en-word-submissions/(\d+)/$' => fn($id) => $controller->getSubmission($id),

    // GET by student number
    'GET /en-word-submissions/student/([A-Za-z0-9]+)/$' => fn($student_number) => $controller->getByStudent($student_number),

    'GET /en-word-submissions/student-grades/([A-Za-z0-9]+)/$' => fn($student_number) => $controller->getByStudentGrades($student_number),

    // POST create
    'POST /en-word-submissions/$' => fn() => $controller->submitAnswer(),

    // DELETE
    'DELETE /en-word-submissions/(\d+)/$' => fn($id) => $controller->deleteSubmission($id),
];
