<?php
require_once './controllers/Payment/PaymentReasonController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$paymentReasonController = new PaymentReasonController($pdo);

// Define routes
return [
    'GET /payment-reason/' => [$paymentReasonController, 'getAllRecords'],
    'GET /payment-reason/{id}/' => [$paymentReasonController, 'getRecordById'],
    'POST /payment-reason/' => [$paymentReasonController, 'createRecord'],
    'PUT /payment-reason/{id}/' => [$paymentReasonController, 'updateRecord'],
    'DELETE /payment-reason/{id}/' => [$paymentReasonController, 'deleteRecord']
];
