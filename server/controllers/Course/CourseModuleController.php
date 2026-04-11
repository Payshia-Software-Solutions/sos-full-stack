<?php
require_once './models/Course/CourseModule.php';

class CourseModuleController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new CourseModule($pdo);
    }

    // Get all module records
    public function getAllModules()
    {
        $modules = $this->model->getAllModules();
        echo json_encode($modules);
    }

    // Get a single module by ID
    public function getModuleById($id)
    {
        $module = $this->model->getModuleById($id);
        if ($module) {
            echo json_encode($module);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Module not found']);
        }
    }


    // Get a specific course module by module_code
public function getModuleByCode($module_code)
{
    $module = $this->model->getModuleByCode($module_code);
    if ($module) {
        echo json_encode($module);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Module not found']);
    }
}

    // Create a new module record
    public function createModule()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateModuleData($data)) {
            $this->model->createModule($data);
            http_response_code(201);
            echo json_encode(['message' => 'Module created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid module data']);
        }
    }

    // Update an existing module record
    public function updateModule($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($this->validateModuleData($data)) {
            $this->model->updateModule($id, $data);
            echo json_encode(['message' => 'Module updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid module data']);
        }
    }

    // Delete a module record by ID
    public function deleteModule($id)
    {
        $this->model->deleteModule($id);
        echo json_encode(['message' => 'Module deleted successfully']);
    }

    // Get all active modules
    public function getActiveModules()
    {
        $modules = $this->model->getActiveModules();
        echo json_encode($modules);
    }

    // Get modules by course code
    public function getModulesByCourseCode($courseCode)
    {
        $modules = $this->model->getModulesByCourseCode($courseCode);
        echo json_encode($modules);
    }

    // Validate module data
    private function validateModuleData($data)
    {
        return isset($data['module_code'], $data['credit'], $data['module_name'], $data['duration'], $data['level'], $data['course_code'], $data['is_active']);
    }
}
