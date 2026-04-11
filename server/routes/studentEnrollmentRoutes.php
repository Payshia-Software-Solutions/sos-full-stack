<?php
// routes/StudentCourseRoutes.php

require_once './controllers/StudentCourseControllerNew.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$studentCourseController = new StudentCourseControllerNew($pdo);

// Define an array of routes
return [
    // GET all student course enrollments with user details
    'GET /student-courses-new/$' => function () use ($studentCourseController) {
        return $studentCourseController->getAll();
    },

    // GET a single student course enrollment with user details by ID
    'GET /student-courses-new/(\d+)/$' => function ($id) use ($studentCourseController) {
        return $studentCourseController->getById($id);
    },

    // GET a single student course enrollment with user details by course code
    'GET /student-courses-new/course-code/([A-Za-z0-9]+)/$' => function ($courseCode) use ($studentCourseController) {
        return $studentCourseController->getByCourseCodeId($courseCode);
    },

    // GET a single student course enrollment with user details by course code
    'GET /student-courses-new/student-number/([A-Za-z0-9]+)/$' => function ($userName) use ($studentCourseController) {
        return $studentCourseController->getByStudentNumber($userName);
    },

    'GET /student-courses-new/student-number/([A-Za-z0-9]+)/parent-course/([A-Za-z0-9]+)/$' => function($userName, $parentCourseId) use ($studentCourseController) {
        $studentCourseController->getByStudentNumberAndParentCourseId($userName, $parentCourseId);
    },

    // POST create a new student course enrollment
    'POST /student-courses-new/$' => function () use ($studentCourseController) {
        return $studentCourseController->create();
    },

    // PUT update a student course enrollment
    'PUT /student-courses-new/(\d+)/$' => function ($id) use ($studentCourseController) {
        return $studentCourseController->update($id);
    },

    // DELETE a student course enrollment
    'DELETE /student-courses-new/(\d+)/$' => function ($id) use ($studentCourseController) {
        return $studentCourseController->delete($id);
    }
    
];
