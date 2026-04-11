<?php
// routes/hpCategoriesRoutes.php

require_once './controllers/HunterPro/HpCategoriesController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpCategoriesController = new HpCategoriesController($pdo);

// Define routes
return [
    'GET /hp-categories/' => [$hpCategoriesController, 'getAllRecords'],
    'GET /hp-categories/{id}/' => [$hpCategoriesController, 'getRecordById'],
    'POST /hp-categories/' => [$hpCategoriesController, 'createRecord'],
    'PUT /hp-categories/{id}/' => [$hpCategoriesController, 'updateRecord'],
    'DELETE /hp-categories/{id}/' => [$hpCategoriesController, 'deleteRecord']
];
