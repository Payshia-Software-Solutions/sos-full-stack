<?php
// models/Assignment.php

class Assignment
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllAssignments()
    {
        $stmt = $this->pdo->query("SELECT * FROM assignment");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAssignmentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM assignment WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createAssignment($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO assignment (course_code, title_id, assignment_id, assignment_name, file_path, due_date, added_date, description, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['course_code'],
            $data['title_id'],
            $data['assignment_id'],
            $data['assignment_name'],
            $data['file_path'],
            $data['due_date'],
            $data['added_date'],
            $data['description'],
            $data['created_at'],
            $data['created_by']
        ]);
    }

    public function updateAssignment($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE assignment SET course_code = ?, title_id = ?, assignment_id = ?, assignment_name = ?, file_path = ?, due_date = ?, added_date = ?, description = ?, created_at = ?, created_by = ? WHERE id = ?");
        return $stmt->execute([
            $data['course_code'],
            $data['title_id'],
            $data['assignment_id'],
            $data['assignment_name'],
            $data['file_path'],
            $data['due_date'],
            $data['added_date'],
            $data['description'],
            $data['created_at'],
            $data['created_by'],
            $id
        ]);
    }

    public function deleteAssignment($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM assignment WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
