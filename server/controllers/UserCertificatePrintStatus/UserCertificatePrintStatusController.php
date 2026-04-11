<?php
require_once './models/StudentCertificates/UserCertificatePrintStatus.php';

class UserCertificatePrintStatusController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new UserCertificatePrintStatus($pdo);
    }

    // Get all records
    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    // Get a record by ID
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

    // Get records by Student Number
    public function getRecordsByStudentNumber($studentNumber)
    {
        $records = $this->model->getRecordsByStudentNumber($studentNumber);
        if ($records) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No records found for the given student number']);
        }
    }

    // Get records by Student Number  and CourseCode
    public function getRecordsByStudentNumberAndCourseCode($studentNumber, $courseCode)
    {
        $records = $this->model->getRecordsByStudentNumberCourseCode($studentNumber, $courseCode);
        if ($records) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No records found for the given student number']);
        }
    }

    // Get records by Certificate ID
    public function getRecordsByCertificateId($certificateId)
    {
        $records = $this->model->getRecordsByCertificateId($certificateId);
        if ($records) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No records found for the given certificate ID']);
        }
    }

    // Get records by Print Status
    public function getRecordsByPrintStatus($printStatus)
    {
        $records = $this->model->getRecordsByPrintStatus($printStatus);
        if ($records) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No records found for the given print status']);
        }
    }

    // Create a new record
    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            $success = $this->model->createRecord($data);
            if ($success) {
                http_response_code(201);
                echo json_encode(['message' => 'Record created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create record']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    // Update an existing record
    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            $success = $this->model->updateRecord($id, $data);
            if ($success) {
                echo json_encode(['message' => 'Record updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update record']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    // Delete a record
    public function deleteRecord($id)
    {
        $success = $this->model->deleteRecord($id);
        if ($success) {
            echo json_encode(['message' => 'Record deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete record']);
        }
    }

    // Validate incoming data before inserting/updating
    private function validateData($data)
    {
        // Basic validation for required fields
        return isset(
            $data['student_number'],
            $data['certificate_id'],
            $data['print_date'],
            $data['print_status'],
            $data['print_by'],
            $data['type'],
            $data['course_code']
        ) && $this->validateDataTypes($data);
    }

    // Additional validation for data types, dates, and formats
    private function validateDataTypes($data)
    {
        // Example: Check if 'print_date' is in valid date format
        if (!strtotime($data['print_date'])) {
            return false;
        }

        // Example: Check if 'print_status' is a valid boolean
        if (!in_array($data['print_status'], [0, 1], true)) {
            return false;
        }

        // Add more validation checks for other fields as necessary

        return true;
    }
}
