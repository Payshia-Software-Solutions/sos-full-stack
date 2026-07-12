<?php

class CourseContent
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getByCourseCode($course_code)
    {
        $stmt = $this->pdo->prepare("SELECT id, course_code, title_name, title_description, created_by, created_at FROM course_content WHERE course_code = ? ORDER BY id ASC");
        $stmt->execute([$course_code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO course_content (course_code, title_name, title_description, created_by) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['course_code'], $data['title_name'], $data['title_description'] ?? null, $data['created_by']]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE course_content SET title_name = ?, title_description = ? WHERE id = ?");
        return $stmt->execute([$data['title_name'], $data['title_description'] ?? null, $id]);
    }

    public function delete($id)
    {
        // Delete related course_content_titles first (foreign key constraint)
        $stmtTitles = $this->pdo->prepare("DELETE FROM course_content_titles WHERE title_id = ?");
        $stmtTitles->execute([$id]);

        $stmt = $this->pdo->prepare("DELETE FROM course_content WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
