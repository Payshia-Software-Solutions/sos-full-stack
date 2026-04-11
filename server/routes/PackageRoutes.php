<?php
// routes/PackageRoutes.php

require_once './controllers/PackageController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$packageController = new PackageController($pdo);

// Define an array of routes
return [
    // GET all packages
    'GET /packages/$' => function () use ($packageController) {
        return $packageController->getPackages();
    },

    // GET a single package by ID
    'GET /packages/(\d+)/$' => function ($package_id) use ($packageController) {
        return $packageController->getPackage($package_id);
    },

    // GET packages by selected course IDs (course_ids=1,2,3)
    'GET /packages/by-courses\?course_ids=([\d,]+)/$' => function () use ($packageController) {
        $course_ids = isset($_GET['course_ids']) ? explode(',', $_GET['course_ids']) : [];

        if (empty($course_ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing or invalid course_ids parameter']);
            return;
        }

        return $packageController->getPackagesByCourseIds($course_ids);
    },


    // POST create a new package
    'POST /packages/$' => function () use ($packageController) {
        return $packageController->createPackage();
    },

    // PUT update a package
    'PUT /packages/(\d+)/$' => function ($package_id) use ($packageController) {
        return $packageController->updatePackage($package_id);
    },


    // PUT update a package
    'POST /packages/(\d+)/$' => function ($package_id) use ($packageController) {
        return $packageController->updatePackage($package_id);
    },


    // DELETE a package
    'DELETE /packages/(\d+)/$' => function ($package_id) use ($packageController) {
        return $packageController->deletePackage($package_id);
    },
];
