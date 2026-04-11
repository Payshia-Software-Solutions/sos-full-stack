<?php
// controllers/CertificationCenter/CcCertificateListController.php

require_once './models/CertificationCenter/CcCertificateList.php';

class CcCertificateListController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CcCertificateList($pdo);
    }

    public function getCertificates()
    {
        $certificates = $this->model->getAllCertificates();
        echo json_encode($certificates);
    }

    public function getCertificate($id)
    {
        $certificate = $this->model->getCertificateById($id);
        echo json_encode($certificate);
    }

    public function getCertificateByListName($list_name)
    {
        $user = $this->model->getCertificateByListName($list_name);
        if ($list_name) {
            echo json_encode($list_name);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function createCertificate()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createCertificate($data);
        echo json_encode(['status' => 'success', 'message' => 'CcCertificateList created']);
    }

    public function updateCertificate($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateCertificate($id, $data);
        echo json_encode(['status' => 'CcCertificateList updated']);
    }

    public function deleteCertificate($id)
    {
        $this->model->deleteCertificate($id);
        echo json_encode(['status' => 'CcCertificateList deleted']);
    }
}
