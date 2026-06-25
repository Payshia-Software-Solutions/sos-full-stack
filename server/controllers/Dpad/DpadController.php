<?php
// controllers/DpadController.php

require_once './models/Dpad/DpadModel.php';

class DpadController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new DpadModel($pdo);
    }

    public function getActivePrescriptions()
    {
        $prescriptions = $this->model->getActivePrescriptions();
        echo json_encode($prescriptions);
    }

    public function getSubmittedAnswers($loggedUser)
    {
        $answers = $this->model->getSubmittedAnswersByUser($loggedUser);
        echo json_encode($answers);
    }

    public function getPrescriptionCovers($prescriptionId)
    {
        $covers = $this->model->getPrescriptionCoversDpad($prescriptionId);
        echo json_encode($covers);
    }

    public function getPrescriptionDetails($prescriptionId)
    {
        $details = $this->model->getPrescriptionDetails($prescriptionId);
        echo json_encode($details);
    }

    public function submitAnswer($loggedUser)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $result = $this->model->submitAnswer($loggedUser, $input);
        echo json_encode($result);
    }

    public function getOverallGrade($loggedUser)
    {
        $overallGrade = $this->model->calculateOverallGradeDpad($loggedUser);
        echo json_encode($overallGrade);
    }

    public function getAllPrescriptions()
    {
        $prescriptions = $this->model->getAllPrescriptions();
        echo json_encode($prescriptions);
    }

    public function savePrescription()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $result = $this->model->savePrescription($input);
        echo json_encode($result);
    }

    public function saveAnswerKey($loggedUser)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $result = $this->model->saveAnswerKey($loggedUser, $input);
        echo json_encode($result);
    }

    public function getAnswerKey($prescriptionId, $coverId)
    {
        $result = $this->model->getAnswerKey($prescriptionId, $coverId);
        echo json_encode($result);
    }
}

