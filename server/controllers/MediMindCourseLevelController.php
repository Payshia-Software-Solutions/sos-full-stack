<?php
require_once __DIR__ . '/../models/MediMindCourseLevel.php';

class MediMindCourseLevelController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new MediMindCourseLevel($pdo);
    }

    public function getAllAssignments()
    {
        echo json_encode($this->model->getAll());
    }

    public function getByCourse($course_code)
    {
        echo json_encode($this->model->getLevelsByCourse($course_code));
    }

    public function assignLevel()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['course_code']) || !isset($data['level_id']) || !isset($data['assigned_by'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        try {
            $this->model->assign($data);
            echo json_encode(['success' => true, 'message' => 'Level assigned to course successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function unassignLevel()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['course_code']) || !isset($data['level_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        try {
            $this->model->unassign($data['course_code'], $data['level_id']);
            echo json_encode(['success' => true, 'message' => 'Level unassigned from course successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getLevelsForStudent()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $course_codes = isset($data['course_codes']) ? $data['course_codes'] : [];
        
        $allLevels = [];
        foreach ($course_codes as $code) {
            $levels = $this->model->getLevelsByCourse($code);
            $allLevels = array_merge($allLevels, $levels);
        }

        // Remove duplicates by ID
        $uniqueLevels = [];
        $ids = [];
        foreach ($allLevels as $level) {
            if (!in_array($level['id'], $ids)) {
                $ids[] = $level['id'];
                $uniqueLevels[] = $level;
            }
        }

        echo json_encode($uniqueLevels);
    }

    public function getBatchProgressReport($course_code)
    {
        echo json_encode($this->model->getBatchProgressReport($course_code));
    }
}
