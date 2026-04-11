<?php
require_once './controllers/Hunter/HunterStoreController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterStoreController = new HunterStoreController($pdo);

// Define routes
return [
    'GET /hunter-store/' => [$hunterStoreController, 'getAllRecords'],
    'GET /hunter-store/{id}/' => [$hunterStoreController, 'getRecordById'],
    'POST /hunter-store/' => [$hunterStoreController, 'createRecord'],
    'PUT /hunter-store/{id}/' => [$hunterStoreController, 'updateRecord'],
    'DELETE /hunter-store/{id}/' => [$hunterStoreController, 'deleteRecord']
];
