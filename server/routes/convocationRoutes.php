<?php
// routes/convocationRoutes.php

require_once './controllers/ConvocationController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$convocationController = new ConvocationController($pdo);

// Define an array of routes
return [
    // GET all convocations
    'GET /convocations/$' => function () use ($convocationController) {
        return $convocationController->getAllConvocations();
    },

    // GET a single convocation by ID
    'GET /convocations/(\d+)/$' => function ($id) use ($convocationController) {
        return $convocationController->getConvocationById($id);
    },

    // POST create a new convocation
    'POST /convocations/$' => function () use ($convocationController) {
        return $convocationController->createConvocation();
    },

    // PUT update a convocation
    'PUT /convocations/(\d+)/$' => function ($id) use ($convocationController) {
        return $convocationController->updateConvocation($id);
    },

    // DELETE a convocation
    'DELETE /convocations/(\d+)/$' => function ($id) use ($convocationController) {
        return $convocationController->deleteConvocation($id);
    },
];
