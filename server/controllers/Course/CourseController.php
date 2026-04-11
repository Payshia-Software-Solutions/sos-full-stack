<?php
require_once './models/Course/Course.php';

class CourseController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Course($pdo);
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

    public function getRecordByParentId($id)
    {
        $record = $this->model->getRecordByParentId($id);
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


    // New method for fetching course by course_code
    public function getRecordByCourseCode($course_code)
    {
        // Debugging log to check the incoming course_code
        error_log("Fetching course for course_code: $course_code");

        // Fetch the record from the model
        $record = $this->model->getRecordByCourseCode(trim($course_code));

        if ($record) {
            // Log and return the record as JSON
            error_log("Course found: " . json_encode($record));
            echo json_encode($record);
        } else {
            // Log and return a 404 error
            error_log("Course not found for course_code: $course_code");
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
        }
    }
}
