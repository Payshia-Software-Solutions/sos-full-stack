<?php
require_once './controllers/Community/CommunityKnowledgebaseController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$communityKBController = new CommunityKnowledgebaseController($pdo);

// Define routes
return [
    'GET /community-knowledgebase/' => [$communityKBController, 'getAllRecords'],
    'GET /community-knowledgebase/{id}/' => [$communityKBController, 'getRecordById'],
    'POST /community-knowledgebase/' => [$communityKBController, 'createRecord'],
    'PUT /community-knowledgebase/{id}/' => [$communityKBController, 'updateRecord'],
    'DELETE /community-knowledgebase/{id}/' => [$communityKBController, 'deleteRecord']
];
