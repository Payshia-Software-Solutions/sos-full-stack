<?php
// controllers/Prescription/PrescriptionController.php

require_once './models/Prescription/Prescription.php';

class PrescriptionController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Prescription($pdo);
    }

    public function getPrescriptions()
    {
        $prescriptions = $this->model->getAllPrescription();
        echo json_encode($prescriptions);
    }

    public function getPrescription($id)
    {
        $prescription = $this->model->getPrescriptionById($id);
        echo json_encode($prescription);
    }

    public function createPrescription()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createPrescription($data);
        echo json_encode(['status' => 'Prescription created']);
    }

    public function updatePrescription($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updatePrescription($id, $data);
        echo json_encode(['status' => 'Prescription updated']);
    }

    public function deletePrescription($id)
    {
        $this->model->deletePrescription($id);
        echo json_encode(['status' => 'Prescription deleted']);
    }
}
