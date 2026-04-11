<?php
// routes/appointmentCategoryRoutes.php

require_once './controllers/AppointmentCategoryController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$appointmentCategoryController = new AppointmentCategoryController($pdo);

// Define routes
return [
    'GET /appointment-category/' => [$appointmentCategoryController, 'getAllRecords'],
    'GET /appointment-category/{id}/' => [$appointmentCategoryController, 'getRecordById'],
    'POST /appointment-category/' => [$appointmentCategoryController, 'createRecord'],
    'PUT /appointment-category/{id}/' => [$appointmentCategoryController, 'updateRecord'],
    'DELETE /appointment-category/{id}/' => [$appointmentCategoryController, 'deleteRecord']
];
