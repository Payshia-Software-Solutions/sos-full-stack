<?php
// routes/ceylonPharmacy/carePaymentAnswerRoutes.php

require_once __DIR__ . '/../../controllers/ceylonPharmacy/CarePaymentAnswerController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$carePaymentAnswerController = new CarePaymentAnswerController($pdo);

// Define routes
return [
    'GET /care-payment-answers/$' => function () use ($carePaymentAnswerController) {
        $carePaymentAnswerController->getAll();
    },
    'GET /care-payment-answers/(\d+)/$' => function ($id) use ($carePaymentAnswerController) {
        $carePaymentAnswerController->getById($id);
    },
    'POST /care-payment-answers/$' => function () use ($carePaymentAnswerController) {
        $carePaymentAnswerController->create();
    },
    'PUT /care-payment-answers/(\d+)/$' => function ($id) use ($carePaymentAnswerController) {
        $carePaymentAnswerController->update($id);
    },
    'DELETE /care-payment-answers/(\d+)/$' => function ($id) use ($carePaymentAnswerController) {
        $carePaymentAnswerController->delete($id);
    },
    'GET /care-payment-answers/correct/([a-zA-Z0-9_\\-]+)/([a-zA-Z0-9_\\-]+)/$' => function ($presCode, $studentId) use ($carePaymentAnswerController) {
        $carePaymentAnswerController->getCorrectAnswers($presCode, $studentId);
    },
];
