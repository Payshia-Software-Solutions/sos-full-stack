<?php
// controllers/ConvocationStudentInfoController.php

require_once 'models/ConvocationStudentInfo.php';

class ConvocationStudentInfoController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new ConvocationStudentInfo($pdo);
    }

    public function getAllStudentInfo()
    {
        $data = $this->model->getAllStudentInfo();
        echo json_encode($data);
    }

    public function getStudentInfoById($id)
    {
        $data = $this->model->getStudentInfoById($id);
        if ($data) {
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Student info not found"]);
        }
    }

    public function getStudentInfoByConvocationId($convocationId)
    {
        $data = $this->model->getStudentInfoByConvocationId($convocationId);
        echo json_encode($data);
    }

    public function getStudentInfoByNumber($studentNumber, $convocationId)
    {
        $data = $this->model->getStudentInfoByNumber($studentNumber, $convocationId);
        if ($data) {
            echo json_encode($data);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Student info not found"]);
        }
    }

    public function createStudentInfo()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->model->createStudentInfo($data)) {
            http_response_code(201);
            echo json_encode(["message" => "Student info created successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create student info"]);
        }
    }

    public function updateStudentInfo($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->model->updateStudentInfo($id, $data)) {
            echo json_encode(["message" => "Student info updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update student info"]);
        }
    }

    public function uploadCsv()
    {
        $convocationId = $_POST['convocation_id'] ?? null;
        if (!$convocationId) {
            http_response_code(400);
            echo json_encode(["error" => "Convocation ID is required"]);
            return;
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["error" => "No file uploaded or file upload error"]);
            return;
        }

        $fileTmpPath = $_FILES['file']['tmp_name'];
        $handle = fopen($fileTmpPath, "r");
        
        // Skip header
        fgetcsv($handle);

        $studentList = [];
        while (($row = fgetcsv($handle)) !== FALSE) {
            // Expecting: student_number, ceremony_number
            if (count($row) < 2) continue;
            
            $studentList[] = [
                'convocation_id' => $convocationId,
                'student_number' => trim($row[0]),
                'ceremony_number' => trim($row[1])
            ];
        }
        fclose($handle);

        if (empty($studentList)) {
            echo json_encode(["message" => "No valid records found in CSV"]);
            return;
        }

        if ($this->model->batchInsertStudentInfo($studentList)) {
            echo json_encode(["message" => "CSV uploaded and processed successfully", "count" => count($studentList)]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to process CSV data"]);
        }
    }

    public function deleteStudentInfo($id)
    {
        if ($this->model->deleteStudentInfo($id)) {
            echo json_encode(["message" => "Student info deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete student info"]);
        }
    }
}
