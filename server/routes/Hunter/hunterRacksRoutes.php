<?php
require_once './controllers/Hunter/HunterRacksController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterRacksController = new HunterRacksController($pdo);

// Define routes
return [
    'GET /hunter-racks/' => [$hunterRacksController, 'getAllRecords'],
    'GET /hunter-racks/{id}/' => [$hunterRacksController, 'getRecordById'],
    'POST /hunter-racks/' => [$hunterRacksController, 'createRecord'],
    'PUT /hunter-racks/{id}/' => [$hunterRacksController, 'updateRecord'],
    'DELETE /hunter-racks/{id}/' => [$hunterRacksController, 'deleteRecord']
];
