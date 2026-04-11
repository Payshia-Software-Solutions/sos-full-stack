<?php
require_once './controllers/Course/CourseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$courseController = new CourseController($pdo);

// Define routes
return [
    'GET /course/' => [$courseController, 'getAllRecords'],
    'GET /course/{id}/' => [$courseController, 'getRecordById'],
    'GET /course/parent/{id}/' => [$courseController, 'getRecordByParentId'],
    'POST /course/' => [$courseController, 'createRecord'],
    'PUT /course/{id}/' => [$courseController, 'updateRecord'],
    'DELETE /course/{id}/' => [$courseController, 'deleteRecord'],

    'GET /course/code/{course_code}/' => [$courseController, 'getRecordByCourseCode'],


];
