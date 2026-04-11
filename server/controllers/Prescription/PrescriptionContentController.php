<?php
// controllers/Prescription/PrescriptionContentController.php

require_once './models/Prescription/PrescriptionContent.php';

class PrescriptionContentController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new PrescriptionContent($pdo);
    }

    public function getPrescriptionContents()
    {
        $prescriptions = $this->model->getAllPrescriptionContent();
        echo json_encode($prescriptions);
    }

    public function getPrescriptionContent($id)
    {
        $prescription = $this->model->getPrescriptionContentById($id);
        echo json_encode($prescription);
    }

    public function createPrescriptionContent()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createPrescriptionContent($data);
        echo json_encode(['status' => 'Prescription created']);
    }

    public function updatePrescriptionContent($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updatePrescriptionContent($id, $data);
        echo json_encode(['status' => 'Prescription updated']);
    }

    public function deletePrescriptionContent($id)
    {
        $this->model->deletePrescriptionContent($id);
        echo json_encode(['status' => 'Prescription deleted']);
    }
}
