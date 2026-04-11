<?php

require_once __DIR__ . '/../../controllers/MediMindLevelController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindLevelController($pdo);

// Define routes
return [
    'GET /medi-mind-levels/' => [$controller, 'getAll'],
    'GET /medi-mind-levels/{id}/' => [$controller, 'getById'],
    'POST /medi-mind-levels/' => [$controller, 'create'],
    'PUT /medi-mind-levels/{id}/' => [$controller, 'update'],
    'DELETE /medi-mind-levels/{id}/' => [$controller, 'delete'],
];
