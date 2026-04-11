<?php

// Include the controller and model files
require_once './controllers/Hunter/HunterMedicineController.php';

// Instantiate the controller with the PDO instance
$pdo = $GLOBALS['pdo']; // Assuming you have a global PDO instance
$hunterMedicineController = new HunterMedicineController($pdo);

// Define routes and map them to controller actions
return [
    'GET /hunter_medicine' => [$hunterMedicineController, 'getAllRecords'],
    'GET /hunter_medicine/{id}' => [$hunterMedicineController, 'getRecordById'],
    'POST /hunter_medicine' => [$hunterMedicineController, 'createRecord'],
    'PUT /hunter_medicine/{id}' => [$hunterMedicineController, 'updateRecord'],
    'DELETE /hunter_medicine/{id}' => [$hunterMedicineController, 'deleteRecord'],
    'GET /hunter-medicine/hunter' => [$hunterMedicineController, 'HunterMedicines']


];
