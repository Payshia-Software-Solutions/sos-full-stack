<?php
// controllers/ConvocationRegistrationByConvocationController.php

require_once './models/ConvocationRegistration.php';

class ConvocationRegistrationByConvocationController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new ConvocationRegistration($pdo);
    }

    public function getRegistrationsByConvocationId($convocationId)
    {
        $registrations = $this->model->getRegistrationsByConvocationId($convocationId);
        if ($registrations) {
            echo json_encode($registrations);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No registrations found for the specified convocation ID']);
        }
    }
}
