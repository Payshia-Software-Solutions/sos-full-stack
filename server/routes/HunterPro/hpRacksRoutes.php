<?php
// routes/hpRacksRoutes.php

require_once './controllers/HunterPro/HpRacksController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpRacksController = new HpRacksController($pdo);

// Define routes
return [
    'GET /hp-racks/' => [$hpRacksController, 'getAllRecords'],
    'GET /hp-racks/{id}/' => [$hpRacksController, 'getRecordById'],
    'POST /hp-racks/' => [$hpRacksController, 'createRecord'],
    'PUT /hp-racks/{id}/' => [$hpRacksController, 'updateRecord'],
    'DELETE /hp-racks/{id}/' => [$hpRacksController, 'deleteRecord']
];
