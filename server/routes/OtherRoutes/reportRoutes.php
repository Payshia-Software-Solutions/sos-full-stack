<?php
// routes/userRoutes.php

require_once './controllers/ReportsController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$reportsController = new ReportsController($pdo);

// Define user routes
return [
    'GET /users/{username}' => [$reportsController, 'getUserInfo'],
];
