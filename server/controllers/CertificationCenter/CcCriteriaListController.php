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
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->model->createCriteriaList($data);
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Criteria List created']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function updateCriteriaList($id)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $this->model->updateCriteriaList($id, $data);
            echo json_encode(['status' => 'success', 'message' => 'Criteria List updated']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function deleteCriteriaList($id)
    {
        try {
            $this->model->deleteCriteriaList($id);
            echo json_encode(['status' => 'success', 'message' => 'Criteria List deleted']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
