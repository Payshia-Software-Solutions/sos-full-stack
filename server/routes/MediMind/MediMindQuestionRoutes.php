<?php

require_once __DIR__ . '/../../controllers/MediMindQuestionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindQuestionController($pdo);

// Define routes
return [
    'GET /medi-mind-questions/' => [$controller, 'getAll'],
    'GET /medi-mind-questions/{id}/' => [$controller, 'getById'],
    'POST /medi-mind-questions/' => [$controller, 'create'],
    'PUT /medi-mind-questions/{id}/' => [$controller, 'update'],
    'DELETE /medi-mind-questions/{id}/' => [$controller, 'delete'],
];
