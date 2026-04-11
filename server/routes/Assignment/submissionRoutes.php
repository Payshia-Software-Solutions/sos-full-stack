<?php
// routes/Assignments/submissionRoutes.php

require_once './controllers/Assignment/AssignmentSubmissionController.php';

$pdo = $GLOBALS['pdo'];
$submissionController = new AssignmentSubmissionController($pdo);

return [
    'GET /submissions/$' => function () use ($submissionController) {
        return $submissionController->getSubmissions();
    },

    'GET /submissions-group-by-student/$' => function () use ($submissionController) {
        return $submissionController->getAllSubmissionsGroupedByStudent();
    },

    'GET /submissions/average-grade\?studentId=([A-Za-z0-9]+)&courseCode=([A-Za-z0-9]+)/$' => function () use ($submissionController) {
        $studentId = $_GET['studentId'] ?? null;
        $courseCode = $_GET['courseCode'] ?? null;

        if ($studentId && $courseCode) {
            return $submissionController->getAverageGradeByStudentAndCourse($studentId, $courseCode);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. studentId and courseCode are required']);
        }
    },

    'GET /submissions/(\d+)/$' => function ($id) use ($submissionController) {
        return $submissionController->getSubmission($id);
    },

    'GET /submissions\?assignment_id=[\w]+/$' => function () use ($submissionController) {
        $assignmentId = $_GET['assignment_id'] ?? null;
        if ($assignmentId) {
            return $submissionController->getSubmissionsByAssignmentId($assignmentId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. assignment_id is required']);
        }
    },


    'GET /submissions\?studentNumber=[\w]+/$' => function () use ($submissionController) {
        $studentNumber = $_GET['studentNumber'] ?? null;
        if ($studentNumber) {
            return $submissionController->getSubmissionsByStudentNumber($studentNumber);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. assignment_id is required']);
        }
    },



    'POST /submissions/$' => function () use ($submissionController) {
        return $submissionController->createSubmission();
    },

    'PUT /submissions/(\d+)/$' => function ($id) use ($submissionController) {
        return $submissionController->updateSubmission($id);
    },

    'DELETE /submissions/(\d+)/$' => function ($id) use ($submissionController) {
        return $submissionController->deleteSubmission($id);
    },
];
