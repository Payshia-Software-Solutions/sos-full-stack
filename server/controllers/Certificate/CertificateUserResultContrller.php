<?php
require_once './models/Certificate/CertificateUserResult.php';

class CertificateUserResultController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CertificateUserResult($pdo);
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

    public function getRecordByKeys($index_number, $course_code, $title_id)
    {
        // Fetch the record from the model
        $record = $this->model->getRecordByKeys($index_number, $course_code, $title_id);

        // Check if the record was found
        if ($record) {
            // Return the record as JSON
            echo json_encode($record);
        } else {
            // If no record found, return a 404 error
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
        }
    }

    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            isset(
                $data['index_number'],
                $data['course_code'],
                $data['title_id'],
                $data['result'],
                $data['created_at'],
                $data['created_by']
            )
        ) {
            $this->model->createRecord($data);
            http_response_code(201);
            echo json_encode(['message' => 'Record created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
        }
    }

    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            isset(
                $data['index_number'],
                $data['course_code'],
                $data['title_id'],
                $data['result'],
                $data['created_at'],
                $data['created_by']
            )
        ) {
            $this->model->updateRecord($id, $data);
            echo json_encode(['message' => 'Record updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
        }
    }

    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }

    public function updateCertificateResult($username, $courseCode, $titleId)
    {
        // Decode the JSON body of the PUT request
        $data = json_decode(file_get_contents("php://input"), true);
        var_dump($data);
        // Check if result and created_by are provided in the body
        if (!isset($data['result']) || !isset($data['created_by'])) {
            echo json_encode(["error" => "Missing required parameters: result and created_by"]);
            return;
        }

        // Get the result and created_by from the request body
        $result = $data['result'];
        $createdBy = $data['created_by'];

        // Assuming the username is the index number
        $indexNo = $username; // Map the username to index number

        // Call the model method to update the certificate result
        if ($this->model->updateCertificateResult($indexNo, $courseCode, $titleId, $result, $createdBy)) {
            echo json_encode(["message" => "Certificate result updated successfully."]);
        } else {
            echo json_encode(["error" => "Failed to update certificate result."]);
        }
    }
}
