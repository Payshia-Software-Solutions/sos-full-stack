<?php
require_once './models/Community/CommunityPostReplyRatings.php';

class CommunityPostReplyRatingsController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CommunityPostReplyRatings($pdo);
    }

    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    public function getRecordById($reply_id)
    {
        $record = $this->model->getRecordById($reply_id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function createOrUpdateRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Ensure 'created_at' is provided
        if (!isset($data['created_at'])) {
            http_response_code(400);
            echo json_encode(['error' => "The 'created_at' timestamp is required."]);
            return;
        }

        // Call the createOrUpdate method from the model
        try {
            $this->model->createOrUpdateRecord($data);
            http_response_code(201);
            echo json_encode(['message' => 'Record created or updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateRecord($reply_id)
    {
        // Get the input data from the request body
        $data = json_decode(file_get_contents("php://input"), true);

        // Ensure 'created_at' and 'ratings' are provided
        if (!isset($data['created_at']) || !isset($data['ratings'])) {
            http_response_code(400);
            echo json_encode(['error' => "Both 'created_at' and 'ratings' are required."]);
            return;
        }

        try {
            // Call the update method from the model
            $this->model->updateRecord($reply_id, $data);
            http_response_code(200);
            echo json_encode(['message' => 'Record updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }


    public function deleteRecord($reply_id)
    {
        $this->model->deleteRecord($reply_id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }

    public function checkUserRecord($reply_id, $created_by)
    {
        $record = $this->model->checkIfUserHasRecord($reply_id, $created_by);
        if ($record) {
            echo json_encode(['has_record' => true, 'record' => $record]);
        } else {
            echo json_encode(['has_record' => false]);
        }
    }
}
