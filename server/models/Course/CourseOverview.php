<?php

class CourseOverview
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all course overviews
    public function getAllOverviews()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_overview");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single course overview by ID
    public function getOverviewById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_overview WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new course overview
    public function createOverview($data)
    {
        $sql = "INSERT INTO course_overview (course_code, overview_title, overview_key, value, is_active, icon) 
                VALUES (:course_code, :overview_title, :overview_key, :value, :is_active, :icon)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update an existing course overview
    public function updateOverview($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE course_overview SET 
                    course_code = :course_code,
                    overview_title = :overview_title,
                    overview_key = :overview_key,
                    value = :value,
                    is_active = :is_active,
                    icon = :icon
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a course overview by ID
    public function deleteOverview($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM course_overview WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Get all active course overviews
    public function getActiveOverviews()
    {
        $stmt = $this->pdo->query("SELECT * FROM course_overview WHERE is_active = 1");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get course overviews by course code
    public function getOverviewsByCourseCode($courseCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course_overview WHERE course_code = :course_code");
        $stmt->execute(['course_code' => $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
