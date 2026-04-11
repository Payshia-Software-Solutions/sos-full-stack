<?php

require_once __DIR__ . '/../../controllers/MediMindStudentAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindStudentAnswerController($pdo);

// Define routes
return [
    'GET /medi-mind-student-answers/$' => function () use ($controller) {
        $controller->getAll();
    },
    'GET /medi-mind-student-answers/(\d+)/$' => function ($id) use ($controller) {
        $controller->getById($id);
    },
    'GET /medi-mind-student-answers/student/([a-zA-Z0-9_\-]+)/$' => function ($studentId) use ($controller) {
        $controller->getByStudent($studentId);
    },
    'GET /medi-mind-student-answers/stats/([a-zA-Z0-9_\-]+)/$' => function ($studentId) use ($controller) {
        $controller->getStatsByStudent($studentId);
    },
    'POST /medi-mind-student-answers/$' => function () use ($controller) {
        $controller->create();
    },
    'PUT /medi-mind-student-answers/(\d+)/$' => function ($id) use ($controller) {
        $controller->update($id);
    },
    'DELETE /medi-mind-student-answers/(\d+)/$' => function ($id) use ($controller) {
        $controller->delete($id);
    },
];
