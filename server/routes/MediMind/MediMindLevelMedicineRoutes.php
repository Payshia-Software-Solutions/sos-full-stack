<?php

require_once __DIR__ . '/../../controllers/MediMindLevelMedicineController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindLevelMedicineController($pdo);

// Define routes
return [
    'GET /medi-mind-level-medicines/$' => function () use ($controller) {
        $controller->getAll();
    },
    'GET /medi-mind-level-medicines/(\d+)/$' => function ($id) use ($controller) {
        $controller->getById($id);
    },
    'GET /medi-mind-level-medicines/level/(\d+)/$' => function ($levelId) use ($controller) {
        $controller->getByLevel($levelId);
    },
    'POST /medi-mind-level-medicines/$' => function () use ($controller) {
        $controller->create();
    },
    'PUT /medi-mind-level-medicines/(\d+)/$' => function ($id) use ($controller) {
        $controller->update($id);
    },
    'DELETE /medi-mind-level-medicines/(\d+)/$' => function ($id) use ($controller) {
        $controller->delete($id);
    },
];
