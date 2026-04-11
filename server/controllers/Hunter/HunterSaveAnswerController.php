<?php
require_once './models/Hunter/HunterSaveAnswer.php';

class HunterSaveAnswerController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new HunterSaveAnswer($pdo);
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
    // Method to get all saved answers
    public function getAllSavedAnswers()
    {
        $savedAnswers = $this->model->getHunterSavedAnswers();
        echo json_encode($savedAnswers);
    }

    // Method to get saved answers by a specific user
    public function HunterSavedAnswersByUser($studentNumber)
    {
        $savedAnswers = $this->model->HunterSavedAnswersByUser($studentNumber);
        echo json_encode($savedAnswers);
    }
}
