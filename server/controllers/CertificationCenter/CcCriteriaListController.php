<?php
// controllers/CertificationCenter/CcCriteriaListController.php

require_once './models/CertificationCenter/CcCriteriaList.php';

class CcCriteriaListController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CcCriteriaList($pdo);
    }

    public function getCriteriaLists()
    {
        $criteriaLists = $this->model->getAllCriteriaLists();
        echo json_encode($criteriaLists);
    }

    public function getCriteriaList($id)
    {
        $criteriaList = $this->model->getCriteriaListById($id);
        echo json_encode($criteriaList);
    }

    public function createCriteriaList()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createCriteriaList($data);
        echo json_encode(['status' => 'Criteria List created']);
    }

    public function updateCriteriaList($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateCriteriaList($id, $data);
        echo json_encode(['status' => 'Criteria List updated']);
    }

    public function deleteCriteriaList($id)
    {
        $this->model->deleteCriteriaList($id);
        echo json_encode(['status' => 'Criteria List deleted']);
    }
}
