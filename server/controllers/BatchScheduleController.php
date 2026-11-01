<?php

require_once './models/BatchSchedule.php';
require_once './models/EducationalQualification.php';

class BatchScheduleController
{
    private $scheduleModel;
    private $qualificationModel;

    public function __construct($pdo)
    {
        $this->scheduleModel = new BatchSchedule($pdo);
        $this->qualificationModel = new EducationalQualification($pdo);
    }

    public function getActiveSchedules()
    {
        $records = $this->scheduleModel->getAllRecords();
        header('Content-Type: application/json');
        echo json_encode($records);
    }

    public function getAllAdminSchedules()
    {
        $records = $this->scheduleModel->getAllAdmin();
        header('Content-Type: application/json');
        echo json_encode($records);
    }

    public function createSchedule()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['name_en'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Schedule name is required']);
            return;
        }

        $id = $this->scheduleModel->createRecord($data);
        http_response_code(201);
        echo json_encode(['message' => 'Schedule created successfully', 'id' => $id]);
    }

    public function updateSchedule($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        $this->scheduleModel->updateRecord($id, $data);
        echo json_encode(['message' => 'Schedule updated successfully']);
    }

    public function getActiveQualifications()
    {
        $records = $this->qualificationModel->getAllRecords();
        header('Content-Type: application/json');
        echo json_encode($records);
    }

    public function getAllAdminQualifications()
    {
        $records = $this->qualificationModel->getAllAdmin();
        header('Content-Type: application/json');
        echo json_encode($records);
    }

    public function createQualification()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['title_en'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Qualification title is required']);
            return;
        }

        $id = $this->qualificationModel->createRecord($data);
        http_response_code(201);
        echo json_encode(['message' => 'Qualification created successfully', 'id' => $id]);
    }

    public function updateQualification($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }

        $this->qualificationModel->updateRecord($id, $data);
        echo json_encode(['message' => 'Qualification updated successfully']);
    }
}
