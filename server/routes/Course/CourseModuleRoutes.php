<?php
require_once './controllers/Course/CourseModuleController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$courseModuleController = new CourseModuleController($pdo);

// Define routes
return [
    // Get all modules
    'GET /course-modules/' => [$courseModuleController, 'getAllModules'],

    // Get a module by ID
    'GET /course-modules/{id}/' => [$courseModuleController, 'getModuleById'],

    // Get a module by module_code
    'GET /course-modules/{module_code}/' => [$courseModuleController, 'getModuleByCode'], // New route

    // Create a new module
    'POST /course-modules/' => [$courseModuleController, 'createModule'],

    // Update a module by ID
    'PUT /course-modules/{id}/' => [$courseModuleController, 'updateModule'],

    // Delete a module by ID
    'DELETE /course-modules/{id}/' => [$courseModuleController, 'deleteModule'],

    // Get active modules
    'GET /course-modules/active/' => [$courseModuleController, 'getActiveModules'],

    // Get modules by course code
    'GET /course-modules/course/{courseCode}/' => [$courseModuleController, 'getModulesByCourseCode']
];
