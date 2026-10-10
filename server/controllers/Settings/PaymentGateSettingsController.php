<?php
// controllers/Settings/PaymentGateSettingsController.php

require_once __DIR__ . '/../../models/Settings/PaymentGateSettings.php';

class PaymentGateSettingsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new PaymentGateSettings($pdo);
    }

    public function getSettings()
    {
        $settings = $this->model->getSettings();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
    }

    public function updateSettings()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
            return;
        }

        $result = $this->model->updateSettings($input);
        if ($result['success']) {
            http_response_code(200);
        } else {
            http_response_code(500);
        }
        echo json_encode($result);
    }

    public function evaluateBalance($balance)
    {
        $eval = $this->model->evaluateLock($balance);
        http_response_code(200);
        echo json_encode($eval);
    }
}
