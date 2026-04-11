<?php

// --- controllers/CourseContentTitleController.php ---
require_once './models/CourseContentTitle.php';

class CourseContentTitleController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseContentTitle($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getById($id)
    {
        $record = $this->model->getById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Record not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid input']);
            return;
        }
        $id = $this->model->create($data);
        echo json_encode(['message' => 'Created successfully', 'id' => $id]);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid input']);
            return;
        }
        if ($this->model->update($id, $data)) {
            echo json_encode(['message' => 'Updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Update failed']);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['message' => 'Deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Delete failed']);
        }
    }
}
