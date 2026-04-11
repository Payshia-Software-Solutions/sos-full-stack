<?php
// routes/courseAssignmentRoutes.php

require_once './controllers/CourseAssignmentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$courseAssignmentController = new CourseAssignmentController($pdo);

// Define course assignment routes
return [
    'GET /assignments/' => [$courseAssignmentController, 'getAssignments'],
    'GET /assignments/course/{course_code}/' => [$courseAssignmentController, 'getAssignmentsByCourse'],
    'GET /assignments/{id}/' => [$courseAssignmentController, 'getAssignment'],
    'POST /assignments/' => [$courseAssignmentController, 'createAssignment'],
    'PUT /assignments/{id}/' => [$courseAssignmentController, 'updateAssignment'],
    'DELETE /assignments/{id}/' => [$courseAssignmentController, 'deleteAssignment']
];