<?php
// routes/Assignments/assignmentRoutes.php

require_once './controllers/Assignment/AssignmentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$assignmentController = new AssignmentController($pdo);

// Define an array of routes
return [
    // Get all assignments
    'GET /v2/assignments/$' => function () use ($assignmentController) {
        return $assignmentController->getAssignments();
    },

    // Get an assignment by ID
    'GET /assignments/(\d+)/$' => function ($id) use ($assignmentController) {
        return $assignmentController->getAssignment($id);
    },

    // Get an assignment by ID
    'GET /assignmentsByCourse/$' => function () use ($assignmentController) {
        return $assignmentController->getAllAssignmentsGroupedByCourse();
    },

    'GET /assignments\?CourseCode=[\w]+/$' => function () use ($assignmentController) {
        $courseCode = $_GET['CourseCode'] ?? null;
        if ($courseCode) {
            return $assignmentController->getAssignmentsByCourse($courseCode);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. CourseCode is required']);
        }
    },



    // Create a new assignment
    'POST /assignments/$' => function () use ($assignmentController) {
        return $assignmentController->createAssignment();
    },

    // Update an assignment by ID
    'PUT /assignments/(\d+)/$' => function ($id) use ($assignmentController) {
        return $assignmentController->updateAssignment($id);
    },

    // Delete an assignment by ID
    'DELETE /assignments/(\d+)/$' => function ($id) use ($assignmentController) {
        return $assignmentController->deleteAssignment($id);
    },
];
