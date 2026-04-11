<?php
require_once './controllers/Hunter/HunterDrugGroupController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterDrugGroupController = new HunterDrugGroupController($pdo);

// Define routes
return [
    'GET /hunter-drug-group/' => [$hunterDrugGroupController, 'getAllRecords'],
    'GET /hunter-drug-group/{id}/' => [$hunterDrugGroupController, 'getRecordById'],
    'POST /hunter-drug-group/' => [$hunterDrugGroupController, 'createRecord'],
    'PUT /hunter-drug-group/{id}/' => [$hunterDrugGroupController, 'updateRecord'],
    'DELETE /hunter-drug-group/{id}/' => [$hunterDrugGroupController, 'deleteRecord']
];
