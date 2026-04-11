<?php
// routes/hpCategoriesRoutes.php

require_once './controllers/HunterPro/HpDosageFormsController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpDosageFormsController = new HpDosageFormsController($pdo);

// Define routes
return [
    'GET /hp-dosage-forms/' => [$hpDosageFormsController, 'getAllRecords'],
    'GET /hp-dosage-forms/{id}/' => [$hpDosageFormsController, 'getRecordById'],
    'POST /hp-dosage-forms/' => [$hpDosageFormsController, 'createRecord'],
    'PUT /hp-dosage-forms/{id}/' => [$hpDosageFormsController, 'updateRecord'],
    'DELETE /hp-dosage-forms/{id}/' => [$hpDosageFormsController, 'deleteRecord']
];
