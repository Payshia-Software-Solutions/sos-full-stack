<?php
// routes/ceylonPharmacy/careSavedAnswersRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CareSavedAnswersController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$careSavedAnswersController = new CareSavedAnswersController($pdo);

// Define routes
return [
    'GET /care-saved-answers' => [$careSavedAnswersController, 'getAll'],
    'GET /care-saved-answers/{id}' => [$careSavedAnswersController, 'getById'],
    'POST /care-saved-answers' => [$careSavedAnswersController, 'create'],
    'PUT /care-saved-answers/{id}' => [$careSavedAnswersController, 'update'],
    'DELETE /care-saved-answers/{id}' => [$careSavedAnswersController, 'delete']
];
