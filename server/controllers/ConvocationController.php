<?php
// controllers/ConvocationController.php

require_once 'models/Convocation.php';

class ConvocationController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Convocation($pdo);
    }

    public function getAllConvocations()
    {
        $convocations = $this->model->getAllConvocations();
        echo json_encode($convocations);
    }

    public function getConvocationById($id)
    {
        $convocation = $this->model->getConvocationById($id);
        if ($convocation) {
            echo json_encode($convocation);
        } else {
            echo json_encode(["error" => "Convocation not found"]);
        }
    }

    public function createConvocation()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $data['created_at'] = date('Y-m-d H:i:s');

        $this->model->createConvocation($data);

        http_response_code(201);
        echo json_encode(["message" => "Convocation created successfully"]);
    }

    public function updateConvocation($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $data['created_at'] = date('Y-m-d H:i:s');

        $this->model->updateConvocation($id, $data);
        echo json_encode(["message" => "Convocation updated successfully"]);
    }

    public function deleteConvocation($id)
    {
        $this->model->deleteConvocation($id);
        echo json_encode(["message" => "Convocation deleted successfully"]);
    }
}
