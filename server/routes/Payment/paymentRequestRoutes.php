<?php
require_once './controllers/Payment/PaymentRequestController.php'; // add

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$paymentRequestController = new PaymentRequestController($pdo);

// Define routes
return [
    'GET /payment-request/' => [$paymentRequestController, 'getAllRecords'],
    'GET /payment-request/getById/{id}/' => [$paymentRequestController, 'getRecordById'],
    'GET /payment-request/getByUserName/{created_by}/' => [$paymentRequestController, 'getRecordByUserName'],
    'GET /payment-request/statistics/' => [$paymentRequestController, 'getStatistics'],
    'GET /payment-request/statistics-by-course/{course_code}/' => [$paymentRequestController, 'getStatisticsByCourse'],
    'GET /payment-request/getByCourseCode/{course_code}/' => [$paymentRequestController, 'getByCourseCode'],
    'POST /payment-request/' => [$paymentRequestController, 'createRecord'],
    'PUT /payment-request/{id}/' => [$paymentRequestController, 'updateRecord'],
    'DELETE /payment-request/{id}/' => [$paymentRequestController, 'deleteRecord']
];
