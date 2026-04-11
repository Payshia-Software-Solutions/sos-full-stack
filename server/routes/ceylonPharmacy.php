<?php
// server/routes/ceylonPharmacy.php

require_once __DIR__ . '/../controllers/ceylonPharmacy/CareContentController.php';
require_once __DIR__ . '/../controllers/ceylonPharmacy/CareCenterCourseController.php';

// Instantiate the controllers
$pdo = $GLOBALS['pdo'];
$careContentController = new CareContentController($pdo);
$careCenterCourseController = new CareCenterCourseController($pdo);

// Define routes
return [
    // --- Care Content Routes ---

    // Get all care contents
    'GET /care-content/$' => function () use ($careContentController) {
        $careContentController->getAll();
    },
    // Get care content by ID
    'GET /care-content/(\d+)/$' => function ($id) use ($careContentController) {
        $careContentController->getById($id);
    },
    // Create new care content
    'POST /care-content/$' => function () use ($careContentController) {
        $careContentController->create();
    },
    // Update care content
    'PUT /care-content/(\d+)/$' => function ($id) use ($careContentController) {
        $careContentController->update($id);
    },
    // Delete care content
    'DELETE /care-content/(\d+)/$' => function ($id) use ($careContentController) {
        $careContentController->delete($id);
    },
    // Get care content by prescription code
    'GET /care-content/pres-code/([^/]+)/$' => function ($presCode) use ($careContentController) {
        $careContentController->getByPresCode($presCode);
    },

    // --- Care Center Course Routes ---

    // Get all courses
    'GET /care-center-courses/$' => function () use ($careCenterCourseController) {
        $careCenterCourseController->getAll();
    },
    // Get course by ID
    'GET /care-center-courses/(\d+)/$' => function ($id) use ($careCenterCourseController) {
        $careCenterCourseController->getById($id);
    },
    // Create new course
    'POST /care-center-courses/$' => function () use ($careCenterCourseController) {
        $careCenterCourseController->create();
    },
    // Update course
    'PUT /care-center-courses/(\d+)/$' => function ($id) use ($careCenterCourseController) {
        $careCenterCourseController->update($id);
    },
    // Delete course
    'DELETE /care-center-courses/(\d+)/$' => function ($id) use ($careCenterCourseController) {
        $careCenterCourseController->delete($id);
    },
    // Get prescriptions for a course
    'GET /care-center-courses/course-code/([^/]+)/prescriptions/$' => function ($courseCode) use ($careCenterCourseController) {
        $careCenterCourseController->getPrescriptionIdsByCourseCode($courseCode);
    },
];
