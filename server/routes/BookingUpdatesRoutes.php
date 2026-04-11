<?php
// routes/BookingUpdatesRoutes.php

require_once './controllers/BookingUpdatesController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$controller = new BookingUpdatesController($pdo);

// Define an array of routes
return [
    'POST /booking-updates/generate-certificate' => function () use ($controller) {
        return $controller->generateCertificate();
    },
];
