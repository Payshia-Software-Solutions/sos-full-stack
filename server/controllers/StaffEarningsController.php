<?php
class StaffEarningsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new StaffEarnings($pdo);
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
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }
        $newId = $this->model->create($data);
        echo json_encode(['id' => $newId]);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->model->update($id, $data)) {
            echo json_encode(['message' => 'Record updated']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Update failed']);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['message' => 'Record deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Delete failed']);
        }
    }
}
