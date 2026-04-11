<?php
// controllers/Prescription/PrescriptionAnswerSbmissionCntroller.php

require_once './models/Prescription/PrescriptionAnswerSubmission.php';

class PrescriptionAnswerSubmissionController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new PrescriptionAnswerSubmission($pdo);
    }

    public function getPrescriptionAnswerSubmissions()
    {
        $prescriptionAnswerSubmissions = $this->model->getAllPrescriptionAnswerSubmission();
        echo json_encode($prescriptionAnswerSubmissions);
    }

    public function getPrescriptionAnswerSubmission($id)
    {
        $prescriptionAnswerSubmission = $this->model->getPrescriptionAnswerSubmissionById($id);
        echo json_encode($prescriptionAnswerSubmission);
    }

    public function createPrescriptionAnswerSubmission()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createPrescriptionAnswerSubmission($data);
        echo json_encode(['status' => 'prescriptionAnswerSubmission created']);
    }

    public function updatePrescriptionAnswerSubmission($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updatePrescriptionAnswerSubmission($id, $data);
        echo json_encode(['status' => 'prescriptionAnswerSubmission updated']);
    }

    public function deletePrescriptionAnswerSubmission($id)
    {
        $this->model->deletePrescriptionAnswerSubmission($id);
        echo json_encode(['status' => 'prescriptionAnswerSubmission deleted']);
    }
}
