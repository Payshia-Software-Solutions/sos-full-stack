<?php
require_once './controllers/Community/CommunityPostController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$communityPostController = new CommunityPostController($pdo);

// Define routes
return [
    'GET /community-post/' => [$communityPostController, 'getAllRecords'],
    'GET /community-post/{id}/' => [$communityPostController, 'getRecordById'],
    'GET /community-post/topics-count/' => [$communityPostController, 'getCategoryPostCount'],
    'POST /community-post/' => [$communityPostController, 'createRecord'],
    'PUT /community-post/{id}/' => [$communityPostController, 'updateRecord'],
    'DELETE /community-post/{id}/' => [$communityPostController, 'deleteRecord']
];
