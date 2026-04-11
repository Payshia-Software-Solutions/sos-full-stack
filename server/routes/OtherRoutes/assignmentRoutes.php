<?php
// routes/assignmentRoutes.php

require_once './controllers/AssignmentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$assignmentController = new AssignmentController($pdo);

// Define assignment routes
return [
    'GET /assignments' => [$assignmentController, 'getAssignments'],
    'POST /assignments' => [$assignmentController, 'createAssignment'],
    'GET /assignments/{id}' => [$assignmentController, 'getAssignment'],
    'PUT /assignments/{id}' => [$assignmentController, 'updateAssignment'],
    'DELETE /assignments/{id}' => [$assignmentController, 'deleteAssignment']
];
