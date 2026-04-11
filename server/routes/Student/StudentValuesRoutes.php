<?php
require_once './controllers/Student/StudentCourseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$studentCourseController = new StudentCourseController($pdo);

// Define routes
return [
    // Get all student-course records
    'GET /student-courses/' => [$studentCourseController, 'getAllRecords'],

    // Get a student-course record by ID
    'GET /student-courses/{id}/' => [$studentCourseController, 'getRecordById'],


    // Get records by student ID
    'GET /student-courses/student/{studentId}/' => [$studentCourseController, 'getRecordsByStudentId'],

    // Create a new student-course record
    'POST /student-courses/' => [$studentCourseController, 'createRecord'],

    // Update a student-course record by ID
    'PUT /student-courses/{id}/' => [$studentCourseController, 'updateRecord'],

    // Delete a student-course record by ID
    'DELETE /student-courses/{id}/' => [$studentCourseController, 'deleteRecord']
];
