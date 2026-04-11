<?php
require_once './models/Course/CourseOverview.php';

class CourseOverviewController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseOverview($pdo);
    }

    // Get all course overviews
    public function getAllOverviews()
    {
        $overviews = $this->model->getAllOverviews();
        echo json_encode($overviews);
    }

    // Get a specific course overview by ID
    public function getOverviewById($id)
    {
        $overview = $this->model->getOverviewById($id);
        if ($overview) {
            echo json_encode($overview);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Overview not found']);
        }
    }

    // Create a new course overview
    public function createOverview()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->createOverview($data);
        http_response_code(201);
        echo json_encode(['message' => 'Overview created successfully']);
    }

    // Update an existing course overview
    public function updateOverview($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->updateOverview($id, $data);
        echo json_encode(['message' => 'Overview updated successfully']);
    }

    // Delete a course overview
    public function deleteOverview($id)
    {
        $this->model->deleteOverview($id);
        echo json_encode(['message' => 'Overview deleted successfully']);
    }

    // Get all active course overviews
    public function getActiveOverviews()
    {
        $activeOverviews = $this->model->getActiveOverviews();
        echo json_encode($activeOverviews);
    }

    // Get course overviews by course code
    public function getOverviewsByCourseCode($courseCode)
    {
        $overviews = $this->model->getOverviewsByCourseCode($courseCode);
        echo json_encode($overviews);
    }
}
