<?php
require_once './controllers/Course/CourseOverviewController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$courseOverviewController = new CourseOverviewController($pdo);

// Define routes
return [
    'GET /course-overviews/' => [$courseOverviewController, 'getAllOverviews'],
    'GET /course-overviews/{id}/' => [$courseOverviewController, 'getOverviewById'],
    'GET /course-overviews/active/' => [$courseOverviewController, 'getActiveOverviews'],
    'GET /course-overviews/course/{courseCode}/' => [$courseOverviewController, 'getOverviewsByCourseCode'],
    'POST /course-overviews/' => [$courseOverviewController, 'createOverview'],
    'PUT /course-overviews/{id}/' => [$courseOverviewController, 'updateOverview'],
    'DELETE /course-overviews/{id}/' => [$courseOverviewController, 'deleteOverview'],
];
