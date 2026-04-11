<?php
require_once './models/AppointmentCategory.php';

class AppointmentCategoryController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new AppointmentCategory($pdo);
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
        if ($data && isset($data['category_name']) && isset($data['created_by']) && isset($data['is_active'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['last_update'] = date('Y-m-d H:i:s');
            $this->model->createRecord($data);
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
        if ($data && isset($data['category_name']) && isset($data['created_by']) && isset($data['is_active'])) {
            $data['last_update'] = date('Y-m-d H:i:s');
            $this->model->updateRecord($id, $data);
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
