<?php

require_once __DIR__ . '/../../controllers/MediMindLevelQuestionController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindLevelQuestionController($pdo);

// Define routes
return [
    'GET /medi-mind-level-questions/' => [$controller, 'getAll'],
    'GET /medi-mind-level-questions/{id}/' => [$controller, 'getById'],
    'GET /medi-mind-level-questions/level/{levelId}/' => [$controller, 'getByLevelId'],
    'POST /medi-mind-level-questions/' => [$controller, 'create'],
    'PUT /medi-mind-level-questions/{id}/' => [$controller, 'update'],
    'DELETE /medi-mind-level-questions/{id}/' => [$controller, 'delete'],
];
