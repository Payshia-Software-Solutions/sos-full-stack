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

    public function getOverallGrade($loggedUser)
    {
        $overallGrade = $this->model->calculateOverallGradeDpad($loggedUser);
        echo json_encode($overallGrade);
    }
}
