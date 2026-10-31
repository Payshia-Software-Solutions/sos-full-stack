<?php
// routes/convocationMedalTypeRoutes.php

require_once './controllers/ConvocationMedalTypeController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$convocationMedalTypeController = new ConvocationMedalTypeController($pdo);

// Define an array of routes
return [
    // GET all medal types
    'GET /convocation-medal-types/$' => function () use ($convocationMedalTypeController) {
        return $convocationMedalTypeController->getAllMedalTypes();
    },

    // GET a single medal type by ID
    'GET /convocation-medal-types/(\d+)/$' => function ($id) use ($convocationMedalTypeController) {
        return $convocationMedalTypeController->getMedalTypeById($id);
    },

    // POST create a new medal type
    'POST /convocation-medal-types/$' => function () use ($convocationMedalTypeController) {
        return $convocationMedalTypeController->createMedalType();
    },

    // PUT update a medal type
    'PUT /convocation-medal-types/(\d+)/$' => function ($id) use ($convocationMedalTypeController) {
        return $convocationMedalTypeController->updateMedalType($id);
    },

    // DELETE a medal type
    'DELETE /convocation-medal-types/(\d+)/$' => function ($id) use ($convocationMedalTypeController) {
        return $convocationMedalTypeController->deleteMedalType($id);
    },
];
