<?php
// routes/hpDrugTypesRoutes.php

require_once './controllers/HunterPro/HpDrugTypesController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpDrugTypesController = new HpDrugTypesController($pdo);

// Define routes
return [
    'GET /hp-drug-types/' => [$hpDrugTypesController, 'getAllRecords'],
    'GET /hp-drug-types/{id}/' => [$hpDrugTypesController, 'getRecordById'],
    'POST /hp-drug-types/' => [$hpDrugTypesController, 'createRecord'],
    'PUT /hp-drug-types/{id}/' => [$hpDrugTypesController, 'updateRecord'],
    'DELETE /hp-drug-types/{id}/' => [$hpDrugTypesController, 'deleteRecord']
];
