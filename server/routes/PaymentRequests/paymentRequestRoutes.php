<?php
// routes/Payments/paymentRequestRoutes.php

require_once './controllers/PaymentRequests/PaymentPortalRequestController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$paymentRequestController = new PaymentPortalRequestController($pdo);

// Define an array of routes
return [
    // Get all payment requests
    'GET /payment-portal-requests/$' => function () use ($paymentRequestController) {
        return $paymentRequestController->getAllRecords();
    },

    // Get a payment request by ID
    'GET /payment-portal-requests/(\d+)/$' => function ($id) use ($paymentRequestController) {
        return $paymentRequestController->getRecordById($id);
    },

    // Get a payment request by Ref Number
    'GET /payment-portal-requests/by-reference/([A-Za-z0-9]+)/$' => function ($unique_number) use ($paymentRequestController) {
        return $paymentRequestController->getRecordByUnique($unique_number);
    },


    // Get a payment request by Ref Number and Reason
    'GET /payment-portal-requests/by-number-type/([a-z_]+)/$' => function ($numberType) use ($paymentRequestController) {
        return $paymentRequestController->getRecordByNumberType($numberType);
    },

    // Create a new payment request
    'POST /payment-portal-requests/$' => function () use ($paymentRequestController) {
        return $paymentRequestController->createRecord();
    },

    // Update a payment request by ID
    'PUT /payment-portal-requests/(\d+)/$' => function ($id) use ($paymentRequestController) {
        return $paymentRequestController->updateRecord($id);
    },


    // Update a payment request status by ID
    'PUT /payment-portal-requests/update-status/(\d+)/$' => function ($id) use ($paymentRequestController) {
        return $paymentRequestController->updatePaymentStatus($id);
    },


    // Delete a payment request by ID
    'DELETE /payment-portal-requests/(\d+)/$' => function ($id) use ($paymentRequestController) {
        return $paymentRequestController->deleteRecord($id);
    },

    // GET a single registration by reference number (same as ID)
    'GET /payment-portal-requests/check-hash\?hashValue=[A-Za-z0-9]+/$' => function () use ($paymentRequestController) {
        $hashValue = isset($_GET['hashValue']) ? $_GET['hashValue'] : null;
        if (!$hashValue) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter: hashValue']);
            return;
        }
        return $paymentRequestController->checkHashDupplicate($hashValue);
    },


    // GET a single registration by reference number (same as ID)
    'GET /payment-portal-requests/get-records\?UniqueNumber=[A-Za-z0-9]+&Reason=[A-Za-z0-9]+/$' => function () use ($paymentRequestController) {
        $UniqueNumber = isset($_GET['UniqueNumber']) ? $_GET['UniqueNumber'] : null;
        $Reason = isset($_GET['Reason']) ? $_GET['Reason'] : null;

        $missing = [];
        if (!$UniqueNumber) $missing[] = 'UniqueNumber';
        if (!$Reason) $missing[] = 'Reason';

        if (!empty($missing)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameter(s): ' . implode(', ', $missing)]);
            return;
        }

        return $paymentRequestController->getPaymentRequestRecordsByReason($UniqueNumber, $Reason);
    },



];
