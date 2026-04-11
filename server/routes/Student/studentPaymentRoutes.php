<?php
require_once './controllers/Student/StudentPaymentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$studentPaymentController = new StudentPaymentController($pdo);

// Define routes
return [
    'GET /student-payment/' => [$studentPaymentController, 'getAllRecords'],
    'GET /student-payment/{id}/' => [$studentPaymentController, 'getRecordById'],
    'POST /student-payment/' => [$studentPaymentController, 'createRecord'],
    'PUT /student-payment/{id}/' => [$studentPaymentController, 'updateRecord'],
    'DELETE /student-payment/{id}/' => [$studentPaymentController, 'deleteRecord'],
    'POST /student-payment-with-status-update/' => [$studentPaymentController, 'createRecordAndUpdateStatus'],
    'GET /student-payment/{username}/' => [$studentPaymentController, 'getRecordByUser'],


];
