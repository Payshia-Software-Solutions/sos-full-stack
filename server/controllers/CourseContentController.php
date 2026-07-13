<?php

require_once './models/CourseContent.php';

class CourseContentController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseContent($pdo);
    }

    public function getByCourseCode($courseCode)
    {
        $records = $this->model->getByCourseCode($courseCode);
        echo json_encode($records);
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['course_code']) || !isset($data['title_name']) || !isset($data['created_by'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        $id = $this->model->create($data);
        echo json_encode(['id' => $id]);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        $success = $this->model->update($id, $data);
        if ($success) {
            echo json_encode(['message' => 'Updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update']);
        }
    }

    public function delete($id)
    {
        $success = $this->model->delete($id);
        if ($success) {
            echo json_encode(['message' => 'Deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete']);
        }
    }
}
