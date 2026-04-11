<?php
require_once './controllers/District/DistrictsController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$districtsController = new DistrictsController($pdo);

// Define routes
return [
    // Retrieve all districts
    'GET /districts' => [$districtsController, 'getAllDistricts'],

    // Retrieve a district by ID
    'GET /districts/{id}' => [$districtsController, 'getDistrictById'],

    // Retrieve districts by province ID
    'GET /districts/province/{provinceId}' => [$districtsController, 'getDistrictsByProvinceId'],

    // Create a new district
    'POST /districts' => [$districtsController, 'createDistrict'],

    // Update an existing district
    'PUT /districts/{id}' => [$districtsController, 'updateDistrict'],

    // Delete a district
    'DELETE /districts/{id}' => [$districtsController, 'deleteDistrict'],
];
