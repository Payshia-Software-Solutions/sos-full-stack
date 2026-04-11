<?php
require_once './controllers/Hunter/HunterCategoryController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterCategoryController = new HunterCategoryController($pdo);

// Define routes
return [
    'GET /hunter-category/' => [$hunterCategoryController, 'getAllRecords'],
    'GET /hunter-category/{id}/' => [$hunterCategoryController, 'getRecordById'],
    'POST /hunter-category/' => [$hunterCategoryController, 'createRecord'],
    'PUT /hunter-category/{id}/' => [$hunterCategoryController, 'updateRecord'],
    'DELETE /hunter-category/{id}/' => [$hunterCategoryController, 'deleteRecord']
];
