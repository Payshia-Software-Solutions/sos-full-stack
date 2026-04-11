<?php
// routes/hpCourseMedicineRoutes.php

require_once './controllers/HunterPro/HpCourseMedicineController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpCourseMedicineController = new HpCourseMedicineController($pdo);

// Define routes
return [
    'GET /hp-course-medicine/' => [$hpCourseMedicineController, 'getAllRecords'],
    'GET /hp-course-medicine/{id}/' => [$hpCourseMedicineController, 'getRecordById'],
    'GET /hp-course-medicine/course/{course_code}/' => [$hpCourseMedicineController, 'getRecordByCourseCode'],
    'POST /hp-course-medicine/' => [$hpCourseMedicineController, 'createRecord'],
    'PUT /hp-course-medicine/{id}/' => [$hpCourseMedicineController, 'updateRecord'],
    'DELETE /hp-course-medicine/{id}/' => [$hpCourseMedicineController, 'deleteRecord']
];
