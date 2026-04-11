<?php
// routes/QMeter/qMeterOpenRoutes.php

require_once './controllers/QMeter/QMeterOpenController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$qMeterOpenController = new QMeterOpenController($pdo);

// Define QMeterOpen routes
return [
    'GET /q-meter-open/' => [$qMeterOpenController, 'getQMeterOpenList'],
    'GET /q-meter-open/{id}/' => [$qMeterOpenController, 'getQMeterOpen'],
    'POST /q-meter-open/' => [$qMeterOpenController, 'createQMeterOpen'],
    'PUT /q-meter-open/{id}/' => [$qMeterOpenController, 'updateQMeterOpen'],
    'DELETE /q-meter-open/{id}/' => [$qMeterOpenController, 'deleteQMeterOpen']
];
