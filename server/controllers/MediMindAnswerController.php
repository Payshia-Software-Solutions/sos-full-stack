<?php
require_once __DIR__ . '/../models/MediMindAnswer.php';

class MediMindAnswerController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new MediMindAnswer($pdo);
    }

    public function getAll()
    {
        $records = $this->model->getAll();
        echo json_encode($records);
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

    public function getByMedicineId($medicineId)
    {
        $records = $this->model->getByMedicineId($medicineId);
        echo json_encode($records);
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['medicine_id']) || !isset($data['question_id']) || !isset($data['answer_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: medicine_id, question_id, answer_id']);
            return;
        }
        $id = $this->model->create($data);
        http_response_code(201);
        echo json_encode(['id' => $id, 'message' => 'Record created successfully']);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->update($id, $data);
        echo json_encode(['message' => 'Record updated successfully']);
    }

    public function delete($id)
    {
        $this->model->delete($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }
}
