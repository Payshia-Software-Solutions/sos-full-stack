<?php
// routes/QMeter/qMeterRoutes.php

require_once './controllers/QMeter/QMeterSubmitController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$qMeterSubmitController = new QMeterSubmitController($pdo);

// Define routes for QMeter
return [
    'GET /q-meter-submits/' => [$qMeterSubmitController, 'getQMeterSubmits'],
    'GET /q-meter-submits/{id}/' => [$qMeterSubmitController, 'getQMeterSubmit'],
    'POST /q-meter-submits/' => [$qMeterSubmitController, 'createQMeterSubmit'],
    'PUT /q-meter-submits/{id}/' => [$qMeterSubmitController, 'updateQMeterSubmit'],
    'DELETE /q-meter-submits/{id}/' => [$qMeterSubmitController, 'deleteQMeterSubmit']
];
