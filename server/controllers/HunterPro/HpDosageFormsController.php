<?php

require_once './models/HunterPro/HpDosageForms.php';

class HpDosageFormsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new HpDosageForms($pdo);
    }

    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    public function getRecordById($id)
    {
        $record = $this->model->getRecordById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['name']) && isset($data['is_active']) && isset($data['created_by'])) {
            $this->model->createRecord([
                'name' => $data['name'],
                'is_active' => $data['is_active'],
                'created_by' => $data['created_by'],
                'created_at' => date('Y-m-d H:i:s')
            ]);
            http_response_code(201);
            echo json_encode(['message' => 'Record created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['name']) && isset($data['is_active']) && isset($data['created_by'])) {
            $this->model->updateRecord($id, [
                'name' => $data['name'],
                'is_active' => $data['is_active'],
                'created_by' => $data['created_by'],
                'created_at' => date('Y-m-d H:i:s')
            ]);
            echo json_encode(['message' => 'Record updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }
}
