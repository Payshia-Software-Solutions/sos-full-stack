<?php

class CourseModule
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all module records
    public function getAllModules()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_modules");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single module by ID
    public function getModuleById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_modules WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get a single module by module_code
public function getModuleByCode($module_code)
{
    $stmt = $this->pdo->prepare("SELECT * FROM course_modules WHERE module_code = :module_code");
    $stmt->execute(['module_code' => $module_code]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

    // Create a new module record
    public function createModule($data)
    {
        $sql = "INSERT INTO course_modules (module_code, credit, module_name, duration, level, course_code, is_active) 
                VALUES (:module_code, :credit, :module_name, :duration, :level, :course_code, :is_active)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update an existing module record
    public function updateModule($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE course_modules SET 
                    module_code = :module_code,
                    credit = :credit,
                    module_name = :module_name,
                    duration = :duration,
                    level = :level,
                    course_code = :course_code,
                    is_active = :is_active
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a module record by ID
    public function deleteModule($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM course_modules WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Get all active modules
    public function getActiveModules()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_modules WHERE is_active = 1");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get modules by course code
    public function getModulesByCourseCode($courseCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_modules WHERE course_code = :course_code");
        $stmt->execute(['course_code' => $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
