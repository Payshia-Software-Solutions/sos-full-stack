<?php
require_once './models/Student/StudentPayment.php';

class StudentPaymentController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new StudentPayment($pdo);
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

    public function getRecordByUser($studentNumber)
    {
        $savedAnswers = $this->model->getRecordByUser($studentNumber);
        echo json_encode($savedAnswers);
    }

    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createRecord($data);
        http_response_code(201);
        echo json_encode(['message' => 'Record created successfully']);
    }

    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateRecord($id, $data);
        echo json_encode(['message' => 'Record updated successfully']);
    }

    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }

    // New method to create record and update status in payment_request table
    public function createRecordAndUpdateStatus()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $response = $this->model->createRecordAndUpdateStatus($data);
            http_response_code(201);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
