<?php

class CourseAssignment
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllAssignments()
    {
        $stmt = $this->pdo->prepare("SELECT id, type, assignment_name, due_date, created_at, created_by, active_status, file_path, course_code FROM course_assignments");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAssignmentsByCourse($course_code)
    {
        $stmt = $this->pdo->prepare("SELECT id, type, assignment_name, due_date, created_at, created_by, active_status, file_path, course_code FROM course_assignments WHERE course_code = :course_code");
        $stmt->bindParam(':course_code', $course_code, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAssignmentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, type, assignment_name, due_date, created_at, created_by, active_status, file_path, course_code FROM course_assignments WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createAssignment($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO course_assignments (type, assignment_name, due_date, created_at, created_by, active_status, file_path, course_code) VALUES (:type, :assignment_name, :due_date, NOW(), :created_by, :active_status, :file_path, :course_code)");
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':assignment_name', $data['assignment_name']);
        $stmt->bindParam(':due_date', $data['due_date']);
        $stmt->bindParam(':created_by', $data['created_by']);
        $stmt->bindParam(':active_status', $data['active_status']);
        $stmt->bindParam(':file_path', $data['file_path']);
        $stmt->bindParam(':course_code', $data['course_code']);
        return $stmt->execute();
    }

    public function updateAssignment($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE course_assignments SET type = :type, assignment_name = :assignment_name, due_date = :due_date, created_by = :created_by, active_status = :active_status, file_path = :file_path, course_code = :course_code WHERE id = :id");
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':assignment_name', $data['assignment_name']);
        $stmt->bindParam(':due_date', $data['due_date']);
        $stmt->bindParam(':created_by', $data['created_by']);
        $stmt->bindParam(':active_status', $data['active_status']);
        $stmt->bindParam(':file_path', $data['file_path']);
        $stmt->bindParam(':course_code', $data['course_code']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function deleteAssignment($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM course_assignments WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
