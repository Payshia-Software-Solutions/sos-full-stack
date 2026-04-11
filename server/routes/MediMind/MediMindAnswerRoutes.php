<?php

require_once __DIR__ . '/../../controllers/MediMindAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindAnswerController($pdo);

// Define routes
return [
    'GET /medi-mind-answers/$' => function () use ($controller) {
        $controller->getAll();
    },
    'GET /medi-mind-answers/(\d+)/$' => function ($id) use ($controller) {
        $controller->getById($id);
    },
    'GET /medi-mind-answers/medicine/(\d+)/$' => function ($medicineId) use ($controller) {
        $controller->getByMedicineId($medicineId);
    },
    'POST /medi-mind-answers/$' => function () use ($controller) {
        $controller->create();
    },
    'PUT /medi-mind-answers/(\d+)/$' => function ($id) use ($controller) {
        $controller->update($id);
    },
    'DELETE /medi-mind-answers/(\d+)/$' => function ($id) use ($controller) {
        $controller->delete($id);
    },
];
