<?php
// controllers/Prescription/PrescriptionAnswerCntroller.php

require_once './models/Prescription/PrescriptionAnswer.php';

class PrescriptionAnswerController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new PrescriptionAnswer($pdo);
    }

    public function getPrescriptionAnswers()
    {
        $prescriptionAnswers = $this->model->getAllPrescriptionAnswer();
        echo json_encode($prescriptionAnswers);
    }

    public function getPrescriptionAnswer($id)
    {
        $prescriptionAnswer = $this->model->getPrescriptionAnswerById($id);
        echo json_encode($prescriptionAnswer);
    }

    public function createPrescriptionAnswer()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createPrescriptionAnswer($data);
        echo json_encode(['status' => 'prescriptionAnswer created']);
    }

    public function updatePrescriptionAnswer($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updatePrescriptionAnswer($id, $data);
        echo json_encode(['status' => 'prescriptionAnswer updated']);
    }

    public function deletePrescriptionAnswer($id)
    {
        $this->model->deletePrescriptionAnswer($id);
        echo json_encode(['status' => 'prescriptionAnswer deleted']);
    }
}
