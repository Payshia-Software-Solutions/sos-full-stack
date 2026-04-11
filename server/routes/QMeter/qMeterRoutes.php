<?php
// routes/QMeter/qMeterRoutes.php

require_once './controllers/QMeter/QMeterController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$qMeterController = new QMeterController($pdo);

// Define routes for QMeter
return [
    'GET /q-meter/' => [$qMeterController, 'getQMeters'],
    'GET /q-meter/{id}/' => [$qMeterController, 'getQMeter'],
    'POST /q-meter/' => [$qMeterController, 'createQMeter'],
    'PUT /q-meter/{id}/' => [$qMeterController, 'updateQMeter'],
    'DELETE /q-meter/{id}/' => [$qMeterController, 'deleteQMeter']
];
