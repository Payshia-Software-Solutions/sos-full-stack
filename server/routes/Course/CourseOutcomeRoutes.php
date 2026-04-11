<?php
require_once './controllers/Course/CourseOutcomeController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$courseOutcomeController = new CourseOutcomeController($pdo);

// Define routes
return [
    'GET /course-outcomes/' => [$courseOutcomeController, 'getAllOutcomes'],
    'GET /course-outcomes/{id}/' => [$courseOutcomeController, 'getOutcomeById'],
    'GET /course-outcomes/active/' => [$courseOutcomeController, 'getActiveOutcomes'],
    'GET /course-outcomes/course/{courseCode}/' => [$courseOutcomeController, 'getOutcomesByCourseCode'],
    'POST /course-outcomes/' => [$courseOutcomeController, 'createOutcome'],
    'PUT /course-outcomes/{id}/' => [$courseOutcomeController, 'updateOutcome'],
    'DELETE /course-outcomes/{id}/' => [$courseOutcomeController, 'deleteOutcome'],
];
