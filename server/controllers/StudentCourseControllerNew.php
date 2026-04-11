<?php
require_once './models/StudentCourseModelNew.php';

class StudentCourseControllerNew
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new StudentCourseModelNew($pdo);
    }

    // GET all student enrollments with user details
    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    // GET single student enrollment with user details
    public function getById($id)
    {
        $record = $this->model->getById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Enrollment not found']);
        }
    }

    // GET single student enrollment by course code
    public function getByCourseCodeId($courseCode)
    {
        $record = $this->model->getByCourseCodeId($courseCode);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Enrollment not found']);
        }
    }

    // GET single student enrollment by student number
    public function getByStudentNumber($userName)
    {
        $record = $this->model->getByStudentNumber($userName);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
        }
    }

    // POST create student enrollment
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $required = ['course_code', 'student_id', 'enrollment_key'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing field: $field"]);
                return;
            }
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        try {
            $id = $this->model->create($data);
            http_response_code(201);
            echo json_encode(['id' => $id, 'message' => 'Enrollment created successfully', 'status' => 'success']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create enrollment', 'details' => $e->getMessage()]);
        }
    }

    // PUT update student enrollment
    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $required = ['course_code', 'student_id', 'enrollment_key'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing field: $field"]);
                return;
            }
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        try {
            $success = $this->model->update($id, $data);
            if ($success) {
                echo json_encode(['message' => 'Enrollment updated successfully', 'status' => 'success']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update enrollment']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update enrollment', 'details' => $e->getMessage()]);
        }
    }

    // DELETE student enrollment
    public function delete($id)
    {
        try {
            $success = $this->model->delete($id);
            if ($success) {
                echo json_encode(['message' => 'Enrollment deleted successfully', 'status' => 'success']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete enrollment']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete enrollment', 'details' => $e->getMessage()]);
        }
    }

    public function getByStudentNumberAndParentCourseId($userName, $parentCourseId)
    {
        $record = $this->model->getByStudentNumberAndParentCourseId($userName, $parentCourseId);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Enrollment not found']);
        }
    }
}
