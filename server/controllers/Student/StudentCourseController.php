<?php
require_once './models/Student/StudentCourse.php';

class StudentCourseController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new StudentCourse($pdo);
    }

    // Get all student-course records
    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    // Get a single student-course record by ID
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

    // Get records by course code
    public function getRecordsByCourseCode($courseCode)
    {
        $records = $this->model->getRecordsByCourseCode($courseCode);
        echo json_encode($records);
    }

    // Get records by student ID
    public function getRecordsByStudentId($studentId)
    {
        $records = $this->model->getRecordsByStudentId($studentId);
        echo json_encode($records);
    }

    // Create a new student-course record
    public function createRecord()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateRecordData($data)) {
            $this->model->createRecord($data);
            http_response_code(201);
            echo json_encode(['message' => 'Record created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid record data']);
        }
    }

    // Update an existing student-course record
    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateRecordData($data)) {
            $this->model->updateRecord($id, $data);
            echo json_encode(['message' => 'Record updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid record data']);
        }
    }

    // Delete a student-course record by ID
    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }

    // Validate record data
    private function validateRecordData($data)
    {
        return isset($data['course_code'], $data['student_id'], $data['enrollment_key']);
    }
}
