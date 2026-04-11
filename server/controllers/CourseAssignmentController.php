<?php
require_once './models/CourseAssignment.php';

class CourseAssignmentController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseAssignment($pdo);
    }

    public function getAssignments()
    {
        $assignments = $this->model->getAllAssignments();
        echo json_encode($assignments);
    }

    public function getAssignmentsByCourse($course_code)
    {
        $assignments = $this->model->getAssignmentsByCourse($course_code);
        echo json_encode($assignments);
    }

    public function getAssignment($id)
    {
        $assignment = $this->model->getAssignmentById($id);
        echo json_encode($assignment);
    }

    public function createAssignment()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createAssignment($data);
        echo json_encode(['status' => 'Assignment created']);
    }

    public function updateAssignment($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateAssignment($id, $data);
        echo json_encode(['status' => 'Assignment updated']);
    }

    public function deleteAssignment($id)
    {
        $this->model->deleteAssignment($id);
        echo json_encode(['status' => 'Assignment deleted']);
    }
}
