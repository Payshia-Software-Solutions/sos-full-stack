<?php
require_once './controllers/Hunter/HunterDosageController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterDosageController = new HunterDosageController($pdo);

// Define routes
return [
    'GET /hunter-dosage/' => [$hunterDosageController, 'getAllRecords'],
    'GET /hunter-dosage/{id}/' => [$hunterDosageController, 'getRecordById'],
    'POST /hunter-dosage/' => [$hunterDosageController, 'createRecord'],
    'PUT /hunter-dosage/{id}/' => [$hunterDosageController, 'updateRecord'],
    'DELETE /hunter-dosage/{id}/' => [$hunterDosageController, 'deleteRecord']
];
