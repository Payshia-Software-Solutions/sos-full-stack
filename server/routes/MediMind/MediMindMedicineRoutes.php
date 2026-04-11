<?php

require_once __DIR__ . '/../../controllers/MediMindMedicineController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindMedicineController($pdo);

// Define routes
return [
    'GET /medi-mind-medicines/' => [$controller, 'getAll'],
    'GET /medi-mind-medicines/{id}/' => [$controller, 'getById'],
    'POST /medi-mind-medicines/' => [$controller, 'create'],
    'PUT /medi-mind-medicines/{id}/' => [$controller, 'update'],
    'DELETE /medi-mind-medicines/{id}/' => [$controller, 'delete'],
];
