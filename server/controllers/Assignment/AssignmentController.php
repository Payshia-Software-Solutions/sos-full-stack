<?php
// controllers/AssignmentController.php

require_once './models/Assignment/Assignment.php';

class AssignmentController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Assignment($pdo);
    }

    public function getAssignments()
    {
        $assignments = $this->model->getAllAssignments();
        echo json_encode($assignments);
    }

    public function getAssignment($id)
    {
        $assignment = $this->model->getAssignmentById($id);
        echo json_encode($assignment);
    }

    public function getAllAssignmentsGroupedByCourse()
    {
        $assignments = $this->model->getAllAssignmentsGroupedByCourse();
        echo json_encode($assignments);
    }

    public function getAssignmentsByCourse($courseCode)
    {
        $assignment = $this->model->getAssignmentsByCourse($courseCode);
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
