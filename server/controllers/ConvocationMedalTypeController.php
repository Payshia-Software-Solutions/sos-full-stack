<?php
// controllers/ConvocationMedalTypeController.php

require_once 'models/ConvocationMedalType.php';

class ConvocationMedalTypeController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new ConvocationMedalType($pdo);
    }

    public function getAllMedalTypes()
    {
        $activeOnly = isset($_GET['active_only']) && ($_GET['active_only'] === '1' || $_GET['active_only'] === 'true');
        $medalTypes = $this->model->getAllMedalTypes($activeOnly);
        header('Content-Type: application/json');
        echo json_encode($medalTypes);
    }

    public function getMedalTypeById($id)
    {
        $medalType = $this->model->getMedalTypeById($id);
        header('Content-Type: application/json');
        if ($medalType) {
            echo json_encode($medalType);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Medal type not found"]);
        }
    }

    public function createMedalType()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(["error" => "Medal name is required"]);
            return;
        }

        $id = $this->model->createMedalType($data);
        http_response_code(201);
        echo json_encode([
            "message" => "Medal type created successfully",
            "id" => $id
        ]);
    }

    public function updateMedalType($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(["error" => "Medal name is required"]);
            return;
        }

        $this->model->updateMedalType($id, $data);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Medal type updated successfully"]);
    }

    public function deleteMedalType($id)
    {
        $this->model->deleteMedalType($id);
        header('Content-Type: application/json');
        echo json_encode(["message" => "Medal type deleted successfully"]);
    }
}
