<?php
// routes/Transaction/transactionPaymentRoutes.php

require_once './controllers/TransactionPaymentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$transactionPaymentController = new TransactionPaymentController($pdo);

// Define the routes
return [
    // Get all payments
    'GET /tc-payments/$' => function () use ($transactionPaymentController) {
        return $transactionPaymentController->getAllPayments();
    },

    // Get payment by ID
    'GET /tc-payments/(\d+)/$' => function ($id) use ($transactionPaymentController) {
        return $transactionPaymentController->getPayment($id);
    },

    // Get payments by student number (query string)
    'GET /tc-payments\?student_number=[\w\-]+/$' => function () use ($transactionPaymentController) {
        $studentNumber = $_GET['student_number'] ?? null;
        if ($studentNumber) {
            return $transactionPaymentController->getPaymentsByStudentNumber($studentNumber);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. student_number is required']);
        }
    },

    // Get payments by student number & reference(query string)
    'GET /tc-payments\?student_number=[\w\-]+&referKey=[\w\-]+/$' => function () use ($transactionPaymentController) {
        $studentNumber = $_GET['student_number'] ?? null;
        $referKey = $_GET['referKey'] ?? null;
        if ($studentNumber && $referKey) {
            return $transactionPaymentController->getPaymentsByStudentNumberAndReference($studentNumber, $referKey);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters. student_number is required']);
        }
    },

    // Create a payment
    'POST /tc-payments/$' => function () use ($transactionPaymentController) {
        return $transactionPaymentController->createPayment();
    },

    // Update a payment by ID
    'PUT /tc-payments/(\d+)/$' => function ($id) use ($transactionPaymentController) {
        return $transactionPaymentController->updatePayment($id);
    },

    // Delete a payment by ID
    'DELETE /tc-payments/(\d+)/$' => function ($id) use ($transactionPaymentController) {
        return $transactionPaymentController->deletePayment($id);
    },

    // Inactive Payment
    'POST /tc-payments/inactive/(\d+)/$' => function ($id) use ($transactionPaymentController) {
        return $transactionPaymentController->InactivePayment($id);
    }
];
