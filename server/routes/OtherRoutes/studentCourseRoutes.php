<?php
// routes/studentCourseRoutes.php

require_once './controllers/BaseStudentCourseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$studentCourseController = new BaseStudentCourseController($pdo);

// Define student course routes
return [
    'GET /studentEnrollments/' => [$studentCourseController, 'getAllEnrollments'],
    'GET /studentEnrollments/course/{course_code}' => [$studentCourseController, 'getAllEnrollmentsByCourse'],
    'GET /studentEnrollments/{id}/' => [$studentCourseController, 'getEnrollmentById'],
    'GET /studentEnrollments/user/{username}/' => [$studentCourseController, 'getEnrollmentByUsername'],
    'POST /studentEnrollments/' => [$studentCourseController, 'createEnrollment'],
    'PUT /studentEnrollments/{id}/' => [$studentCourseController, 'updateEnrollment'],
    'DELETE /studentEnrollments/{id}/' => [$studentCourseController, 'deleteEnrollment']
];
