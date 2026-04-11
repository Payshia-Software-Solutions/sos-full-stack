<?php
require_once './controllers/Hunter/HunterCourseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterCourseController = new HunterCourseController($pdo);

// Define routes
return [
    'GET /hunter-course/' => [$hunterCourseController, 'getAllRecords'],
    'GET /hunter-course/{id}/' => [$hunterCourseController, 'getRecordById'],
    'POST /hunter-course/' => [$hunterCourseController, 'createRecord'],
    'PUT /hunter-course/{id}/' => [$hunterCourseController, 'updateRecord'],
    'DELETE /hunter-course/{id}/' => [$hunterCourseController, 'deleteRecord']
];
