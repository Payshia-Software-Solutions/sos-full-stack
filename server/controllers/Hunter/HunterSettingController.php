<?php
require_once './models/Hunter/HunterSetting.php';

class HunterSettingController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new HunterSetting($pdo);
    }

    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    public function getRecordByName($setting_name)
    {
        $record = $this->model->getRecordByName($setting_name);
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

    public function updateRecord($setting_name)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateRecord($setting_name, $data);
        echo json_encode(['message' => 'Record updated successfully']);
    }

    public function deleteRecord($setting_name)
    {
        $this->model->deleteRecord($setting_name);
        echo json_encode(['message' => 'Record deleted successfully']);
    }
}
