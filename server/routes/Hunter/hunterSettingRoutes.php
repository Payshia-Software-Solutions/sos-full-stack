<?php
// routes/hunterSettingRoutes.php

require_once './controllers/Hunter/HunterSettingController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hunterSettingController = new HunterSettingController($pdo);

// Define routes
return [
    'GET /hunter-settings/' => [$hunterSettingController, 'getAllRecords'],
    'GET /hunter-settings/{setting_name}/' => [$hunterSettingController, 'getRecordByName'],
    'POST /hunter-settings/' => [$hunterSettingController, 'createRecord'],
    'PUT /hunter-settings/{setting_name}/' => [$hunterSettingController, 'updateRecord'],
    'DELETE /hunter-settings/{setting_name}/' => [$hunterSettingController, 'deleteRecord']
];
