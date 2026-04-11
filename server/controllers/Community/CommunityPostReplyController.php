<?php
require_once './models/Community/CommunityPostReply.php';

class CommunityPostReplyController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CommunityPostReply($pdo);
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

    public function getReplyStatistics()
    {
        $statistics = $this->model->getReplyStatistics();
        echo json_encode($statistics);
    }

    public function getRecordsByPostId($postId, $loggedUser)
    {
        $records = $this->model->getRecordsByPostId($postId, $loggedUser);
        echo json_encode($records);
    }
}