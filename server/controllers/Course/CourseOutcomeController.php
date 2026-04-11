<?php
require_once './models/Course/CourseOutcome.php';

class CourseOutcomeController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseOutcome($pdo);
    }

    // Get all course outcomes
    public function getAllOutcomes()
    {
        $outcomes = $this->model->getAllOutcomes();
        echo json_encode($outcomes);
    }

    // Get a specific course outcome by ID
    public function getOutcomeById($id)
    {
        $outcome = $this->model->getOutcomeById($id);
        if ($outcome) {
            echo json_encode($outcome);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Outcome not found']);
        }
    }

    // Create a new course outcome
    public function createOutcome()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createOutcome($data);
        http_response_code(201);
        echo json_encode(['message' => 'Outcome created successfully']);
    }

    // Update an existing course outcome
    public function updateOutcome($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateOutcome($id, $data);
        echo json_encode(['message' => 'Outcome updated successfully']);
    }

    // Delete a course outcome
    public function deleteOutcome($id)
    {
        $this->model->deleteOutcome($id);
        echo json_encode(['message' => 'Outcome deleted successfully']);
    }

    // Get active course outcomes
    public function getActiveOutcomes()
    {
        $activeOutcomes = $this->model->getActiveOutcomes();
        echo json_encode($activeOutcomes);
    }

    // Get outcomes by course code
    public function getOutcomesByCourseCode($courseCode)
    {
        $outcomes = $this->model->getOutcomesByCourseCode($courseCode);
        echo json_encode($outcomes);
    }
}
