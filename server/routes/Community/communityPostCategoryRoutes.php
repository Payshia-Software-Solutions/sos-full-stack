<?php
require_once './controllers/Community/CommunityPostCategoryController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$communityPostCategoryController = new CommunityPostCategoryController($pdo);

// Define routes
return [
    'GET /community-post-category/' => [$communityPostCategoryController, 'getAllRecords'],
    'GET /community-post-category/{id}/' => [$communityPostCategoryController, 'getRecordById'],
    'POST /community-post-category/' => [$communityPostCategoryController, 'createRecord'],
    'PUT /community-post-category/{id}/' => [$communityPostCategoryController, 'updateRecord'],
    'DELETE /community-post-category/{id}/' => [$communityPostCategoryController, 'deleteRecord']
];