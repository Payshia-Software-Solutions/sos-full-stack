<?php

require_once './models/HunterPro/HpMedicines.php';

class HpMedicinesController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new HpMedicines($pdo);
    }

    public function getAllMedicines()
    {
        $medicines = $this->model->getAllMedicines();
        echo json_encode($medicines);
    }

    public function getMedicineById($id)
    {
        $medicine = $this->model->getMedicineById($id);
        if ($medicine) {
            echo json_encode($medicine);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Medicine not found']);
        }
    }

    public function createMedicine()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createMedicine($data);
        http_response_code(201);
        echo json_encode(['message' => 'Medicine created successfully']);
    }

    public function updateMedicine($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateMedicine($id, $data);
        echo json_encode(['message' => 'Medicine updated successfully']);
    }

    public function deleteMedicine($id)
    {
        $this->model->deleteMedicine($id);
        echo json_encode(['message' => 'Medicine deleted successfully']);
    }
}
