<?php

require_once __DIR__ . '/../../controllers/MediMindQuestAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new MediMindQuestAnswerController($pdo);

// Define routes
return [
    'GET /medi-mind-quest-answers/' => [$controller, 'getAll'],
    'GET /medi-mind-quest-answers/{id}/' => [$controller, 'getById'],
    'GET /medi-mind-quest-answers/question/{questionId}/' => [$controller, 'getByQuestionId'],
    'POST /medi-mind-quest-answers/' => [$controller, 'create'],
    'PUT /medi-mind-quest-answers/{id}/' => [$controller, 'update'],
    'DELETE /medi-mind-quest-answers/{id}/' => [$controller, 'delete'],
];
