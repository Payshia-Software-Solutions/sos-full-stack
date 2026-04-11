<?php
require_once './controllers/LectureAvailableController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$lectureController = new LectureAvailableController($pdo);

// Define lecture routes
return [
    'GET /lectures/' => [$lectureController, 'getAllLectures'],
    'GET /availablelectures/' => [$lectureController, 'getAvailableLectures'],
    'GET /lectures/{id}/' => [$lectureController, 'getLectureById'],
    'POST /lectures/' => [$lectureController, 'createLecture'],
    'PUT /lectures/{id}/' => [$lectureController, 'updateLecture'],
    'DELETE /lectures/{id}/' => [$lectureController, 'deleteLecture']
];