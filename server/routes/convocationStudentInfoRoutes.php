<?php
// routes/convocationStudentInfoRoutes.php

require_once './controllers/ConvocationStudentInfoController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new ConvocationStudentInfoController($pdo);

// Define an array of routes
return [
    // GET all student info
    'GET /convocation-student-info/$' => function () use ($controller) {
        return $controller->getAllStudentInfo();
    },

    // GET student info by ID
    'GET /convocation-student-info/(\d+)/$' => function ($id) use ($controller) {
        return $controller->getStudentInfoById($id);
    },

    // GET student info by convocation ID
    'GET /convocation-student-info/convocation/(\d+)/$' => function ($convocationId) use ($controller) {
        return $controller->getStudentInfoByConvocationId($convocationId);
    },

    // GET student info by student number and convocation ID
    'GET /convocation-student-info/student/([A-Za-z0-9]+)/convocation/(\d+)/$' => function ($studentNumber, $convocationId) use ($controller) {
        return $controller->getStudentInfoByNumber($studentNumber, $convocationId);
    },

    // POST upload CSV
    'POST /convocation-student-info/upload-csv/$' => function () use ($controller) {
        return $controller->uploadCsv();
    },

    // POST create student info
    'POST /convocation-student-info/$' => function () use ($controller) {
        return $controller->createStudentInfo();
    },

    // PUT update student info
    'PUT /convocation-student-info/(\d+)/$' => function ($id) use ($controller) {
        return $controller->updateStudentInfo($id);
    },

    // DELETE student info
    'DELETE /convocation-student-info/(\d+)/$' => function ($id) use ($controller) {
        return $controller->deleteStudentInfo($id);
    },
];
