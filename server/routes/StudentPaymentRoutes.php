<?php

require_once './controllers/StudentPaymentController.php';

$pdo = $GLOBALS['pdo'];
$studentPaymentController = new StudentPaymentControllerNew($pdo);

return [
    // Get all student payments
    'GET /student-payments-new/$' => function () use ($studentPaymentController) {
        $studentPaymentController->getAll();
    },

    // Get student payment by ID
    'GET /student-payments-new/(\d+)/$' => function ($id) use ($studentPaymentController) {
        $studentPaymentController->getById($id);
    },

    // Create a new student payment
    'POST /student-payments-new/$' => function () use ($studentPaymentController) {
        $studentPaymentController->create();
    },

    // Update student payment
    'PUT /student-payments-new/(\d+)/$' => function ($id) use ($studentPaymentController) {
        $studentPaymentController->update($id);
    },

    // Delete student payment
    'DELETE /student-payments-new/(\d+)/$' => function ($id) use ($studentPaymentController) {
        $studentPaymentController->delete($id);
    }
];
