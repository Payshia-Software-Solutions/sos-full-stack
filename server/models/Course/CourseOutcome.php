<?php

class CourseOutcome
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Retrieve all course outcomes
    public function getAllOutcomes()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_outcomes");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Retrieve a specific course outcome by ID
    public function getOutcomeById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_outcomes WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new course outcome
    public function createOutcome($data)
    {
        $sql = "INSERT INTO course_outcomes (outcome, course_code, is_active) 
                VALUES (:outcome, :course_code, :is_active)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update an existing course outcome
    public function updateOutcome($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE course_outcomes SET 
                    outcome = :outcome, 
                    course_code = :course_code,
                    is_active = :is_active
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a course outcome
    public function deleteOutcome($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM course_outcomes WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Retrieve active course outcomes
    public function getActiveOutcomes()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_outcomes WHERE is_active = 1");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Retrieve outcomes by course code
    public function getOutcomesByCourseCode($courseCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_outcomes WHERE course_code = :course_code");
        $stmt->execute(['course_code' => $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
