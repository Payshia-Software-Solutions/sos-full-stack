<?php
// controllers/CertificatePrintStatusController.php

require_once './models/CertificatePrintStatus.php';

class CertificatePrintStatusController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CertificatePrintStatus($pdo);
    }

    public function getByCourseCode($courseCode)
    {
        $data = $this->model->getByCourseCode($courseCode);
        if ($data) {
            http_response_code(200);
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No records found for the specified course code']);
        }
    }
}
