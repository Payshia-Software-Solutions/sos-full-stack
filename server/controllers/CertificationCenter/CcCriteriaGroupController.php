<?php
// controllers/CertificationCenter/CcCriteriaGroupController.php

require_once './models/CertificationCenter/CcCriteriaGroup.php';

class CcCriteriaGroupController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CcCriteriaGroup($pdo);
    }

    public function getCriteriaGroups()
    {
        $criteriaGroups = $this->model->getAllCriteriaGroups();
        echo json_encode($criteriaGroups); // Directly output the array without wrapping it
    }

    public function getCriteriaGroup($id)
    {
        $criteriaGroup = $this->model->getCriteriaGroupById($id);
        echo json_encode($criteriaGroup);
    }

    public function createCriteriaGroup()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createCriteriaGroup($data);
        echo json_encode(['status' => 'CriteriaGroup created']);
    }

    public function updateCriteriaGroup($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateCriteriaGroup($id, $data);
        echo json_encode(['status' => 'success', 'message' => 'CriteriaGroup created']);
    }

    public function deleteCriteriaGroup($id)
    {
        $this->model->deleteCriteriaGroup($id);
        echo json_encode(['status' => 'CriteriaGroup deleted']);
    }
}
