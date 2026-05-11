<?php

class MediMindCourseLevel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM medi_mind_course_levels");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCourse($course_code)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM medi_mind_course_levels WHERE course_code = ?");
        $stmt->execute([$course_code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByLevel($level_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM medi_mind_course_levels WHERE level_id = ?");
        $stmt->execute([$level_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function assign($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO medi_mind_course_levels (course_code, level_id, assigned_by) VALUES (?, ?, ?)");
        return $stmt->execute([
            $data['course_code'],
            $data['level_id'],
            $data['assigned_by']
        ]);
    }

    public function unassign($course_code, $level_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM medi_mind_course_levels WHERE course_code = ? AND level_id = ?");
        return $stmt->execute([$course_code, $level_id]);
    }

    public function getLevelsByCourse($course_code)
    {
        $stmt = $this->pdo->prepare("
            SELECT l.* 
            FROM medi_mind_levels l
            JOIN medi_mind_course_levels cl ON l.id = cl.level_id
            WHERE cl.course_code = ?
        ");
        $stmt->execute([$course_code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
