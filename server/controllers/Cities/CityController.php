<?php
require_once './models/Cities/City.php';

class CityController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new City($pdo);
    }

    // Get all city records
    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    // Get a city by ID
    public function getRecordById($id)
    {
        $record = $this->model->getRecordById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'City not found']);
        }
    }

    // Get cities by district ID
    public function getRecordsByDistrictId($district_id)
    {
        $records = $this->model->getRecordsByDistrictId($district_id);
        echo json_encode($records);
    }

    // Create a new city record
    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            $this->model->createRecord($data);
            http_response_code(201);
            echo json_encode(['message' => 'City created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    // Update a city record
    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            $this->model->updateRecord($id, $data);
            echo json_encode(['message' => 'City updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    // Delete a city record
    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'City deleted successfully']);
    }

    // Data validation method
    private function validateData($data)
    {
        return isset($data['district_id'], $data['name_en'], $data['postcode'], $data['latitude'], $data['longitude']);
    }
}
