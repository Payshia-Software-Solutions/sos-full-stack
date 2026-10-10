<?php
// routes/Settings/paymentGateSettingsRoutes.php

require_once './controllers/Settings/PaymentGateSettingsController.php';

$paymentGateController = new PaymentGateSettingsController($pdo);

return [
    'GET /api/payment-gate-settings' => function () use ($paymentGateController) {
        $paymentGateController->getSettings();
    },
    'POST /api/payment-gate-settings' => function () use ($paymentGateController) {
        $paymentGateController->updateSettings();
    },
    'PUT /api/payment-gate-settings' => function () use ($paymentGateController) {
        $paymentGateController->updateSettings();
    },
    'GET /payment-gate-settings' => function () use ($paymentGateController) {
        $paymentGateController->getSettings();
    },
    'POST /payment-gate-settings' => function () use ($paymentGateController) {
        $paymentGateController->updateSettings();
    },
    'PUT /payment-gate-settings' => function () use ($paymentGateController) {
        $paymentGateController->updateSettings();
    },
];
