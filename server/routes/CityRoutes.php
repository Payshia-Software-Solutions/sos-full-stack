<?php
require_once './controllers/Cities/CityController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$cityController = new CityController($pdo);

// Define routes
return [
    // Get all cities
    'GET /cities/' => [$cityController, 'getAllRecords'],

    // Get a city by ID
    'GET /cities/{id}/' => [$cityController, 'getRecordById'],

    // Get cities by district ID
    'GET /cities/district/{district_id}/' => [$cityController, 'getRecordsByDistrictId'],

    // Create a new city
    'POST /cities/' => [$cityController, 'createRecord'],

    // Update a city by ID
    'PUT /cities/{id}/' => [$cityController, 'updateRecord'],

    // Delete a city by ID
    'DELETE /cities/{id}/' => [$cityController, 'deleteRecord'],
];
