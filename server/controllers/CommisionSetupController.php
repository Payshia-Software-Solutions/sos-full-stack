<?php

// --- controllers/CommisionSetupController.php ---
require_once './models/CommisionSetup.php';
class CommisionSetupController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CommisionSetup($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getById($id)
    {
        $data = $this->model->getById($id);
        if ($data) {
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Record not found"]);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $this->model->create($data);
        http_response_code(201);
        echo json_encode(["id" => $id, "message" => "Created successfully"]);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->model->update($id, $data)) {
            echo json_encode(["message" => "Updated successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Update failed"]);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(["message" => "Deleted successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Delete failed"]);
        }
    }
}
