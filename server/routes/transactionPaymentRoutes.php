<?php
// routes/Transaction/transactionPaymentRoutes.php

require_once './controllers/TransactionPaymentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$transactionPaymentController = new TransactionPaymentController($pdo);

// Define the routes
return [
    // Get all payments or filter by student number/reference
    'GET /tc-payments/$' => function () use ($transactionPaymentController) {
        $studentNumber = $_GET['student_number'] ?? null;
        $referKey = $_GET['referKey'] ?? null;

        if ($studentNumber && $referKey) {
            return $transactionPaymentController->getPaymentsByStudentNumberAndReference($studentNumber, $referKey);
        } elseif ($studentNumber) {
            return $transactionPaymentController->getPaymentsByStudentNumber($studentNumber);
        }

        return $transactionPaymentController->getAllPayments();
    },

    // Get payment by ID
    'GET /tc-payments/(\d+)/$' => function ($id) use ($transactionPaymentController) {
        return $transactionPaymentController->getPayment($id);
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
