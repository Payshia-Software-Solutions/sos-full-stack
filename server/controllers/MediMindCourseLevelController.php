<?php
require_once 'models/MediMindCourseLevel.php';

class MediMindCourseLevelController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new MediMindCourseLevel($pdo);
    }

    public function getAllAssignments()
    {
        return $this->model->getAll();
    }

    public function getByCourse($course_code)
    {
        return $this->model->getByCourse($course_code);
    }

    public function assignLevel()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['course_code']) || !isset($data['level_id']) || !isset($data['assigned_by'])) {
            http_response_code(400);
            return ['error' => 'Missing required fields'];
        }

        try {
            $this->model->assign($data);
            return ['success' => true, 'message' => 'Level assigned to course successfully'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }

    public function unassignLevel()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['course_code']) || !isset($data['level_id'])) {
            http_response_code(400);
            return ['error' => 'Missing required fields'];
        }

        try {
            $this->model->unassign($data['course_code'], $data['level_id']);
            return ['success' => true, 'message' => 'Level unassigned from course successfully'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }

    public function getLevelsForStudent()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $course_codes = isset($data['course_codes']) ? $data['course_codes'] : [];
        
        $allLevels = [];
        // course_codes is an array of strings
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

        return $uniqueLevels;
    }
}
