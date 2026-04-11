<?php
// routes/courseAssignmentSubmissionRoutes.php

require_once './controllers/CourseAssignmentSubmissionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$courseAssignmentSubmissionController = new CourseAssignmentSubmissionController($pdo);

// Define course assignment submission routes
return [
    'GET /course_assignments_submissions/' => [$courseAssignmentSubmissionController, 'getSubmissions'],
    'GET /submissions/course/{course_code}/' => [$courseAssignmentSubmissionController, 'getSubmissionsByCourse'],
    'GET /submissions/{id}/' => [$courseAssignmentSubmissionController, 'getSubmission'],
    'GET /submissions/user/{username}/' => [$courseAssignmentSubmissionController, 'getSubmissionsByUser'],
    'GET /submissions/user/{username}/{id}/' => [$courseAssignmentSubmissionController, 'getSubmissionByUser'],
    'GET /submissions/assignment/{username}/{assignment_id}/' => [$courseAssignmentSubmissionController, 'getSubmissionByUserAndAssignment'],
    'POST /submissions/' => [$courseAssignmentSubmissionController, 'createSubmission'],
    'PUT /submissions/{id}/' => [$courseAssignmentSubmissionController, 'updateSubmission'],
    'DELETE /submissions/{id}/' => [$courseAssignmentSubmissionController, 'deleteSubmission']
];
