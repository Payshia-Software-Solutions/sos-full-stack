<?php
// routes/ceylonPharmacy/CareCenterCourseRoutes.php

require_once './controllers/ceylonPharmacy/CareCenterCourseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careCenterCourseController = new CareCenterCourseController($pdo);

// Define routes
return [
    'GET /care-center-courses/$' => function () use ($careCenterCourseController) {
        return $careCenterCourseController->getAll();
    },
    'GET /care-center-courses/(\d+)/$' => function ($id) use ($careCenterCourseController) {
        return $careCenterCourseController->getById($id);
    },
    'POST /care-center-courses/$' => function () use ($careCenterCourseController) {
        return $careCenterCourseController->create();
    },
    'PUT /care-center-courses/(\d+)/$' => function ($id) use ($careCenterCourseController) {
        return $careCenterCourseController->update($id);
    },
    'DELETE /care-center-courses/(\d+)/$' => function ($id) use ($careCenterCourseController) {
        return $careCenterCourseController->delete($id);
    },
    'GET /care-center-courses/student/([^/]+)/course/([^/]+)/$' => function($student_number, $courseCode) use ($careCenterCourseController) {
        return $careCenterCourseController->getPrescriptionIdsByCourseCode($courseCode, $student_number);
    }
];
