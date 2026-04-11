<?php
// routes/Banks/bankRoutes.php

require_once './controllers/BankController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$bankController = new BankController($pdo);

// Define an array of routes
return [
    // Get all banks
    'GET /banks/$' => function () use ($bankController) {
        return $bankController->getAllRecords();
    },

    // Get a bank by ID
    'GET /banks/(\d+)/$' => function ($id) use ($bankController) {
        return $bankController->getRecordById($id);
    },

    // Create a new bank
    'POST /banks/$' => function () use ($bankController) {
        return $bankController->createRecord();
    },

    // Update a bank by ID
    'PUT /banks/(\d+)/$' => function ($id) use ($bankController) {
        return $bankController->updateRecord($id);
    },

    // Delete a bank by ID
    'DELETE /banks/(\d+)/$' => function ($id) use ($bankController) {
        return $bankController->deleteRecord($id);
    },
];
