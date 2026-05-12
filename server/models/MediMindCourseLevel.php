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

    public function getBatchProgressReport($course_code)
    {
        // 1. Get total medicine-level tasks and total questions assigned to this batch
        // We calculate this level-by-level to handle varying question counts correctly.
        $stmtTotal = $this->pdo->prepare("
            SELECT 
                SUM(medicine_count) as total_tasks,
                SUM(medicine_count * question_count) as total_questions_in_batch
            FROM (
                SELECT 
                    cl.level_id,
                    (SELECT COUNT(*) FROM medi_mind_level_mediciens lm WHERE lm.level_id = cl.level_id) as medicine_count,
                    (SELECT COUNT(*) FROM medi_mind_level_questions lq WHERE lq.level_id = cl.level_id) as question_count
                FROM medi_mind_course_levels cl
                WHERE cl.course_code = ?
            ) level_stats
        ");
        $stmtTotal->execute([$course_code]);
        $totalResult = $stmtTotal->fetch(PDO::FETCH_ASSOC);
        
        $totalTasks = 0;
        $totalQuestionsInBatch = 0;
        
        if ($totalResult) {
            $totalTasks = (int)$totalResult['total_tasks'];
            $totalQuestionsInBatch = (int)$totalResult['total_questions_in_batch'];
        }

        // 2. Get student progress (Counting unique Level+Medicine pairs mastered)
        $stmt = $this->pdo->prepare("
            SELECT 
                u.fname, 
                u.lname, 
                u.username,
                sc.course_code,
                COUNT(sa.id) as total_attempts,
                SUM(CASE WHEN sa.correct_status = 'Correct' THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN sa.correct_status = 'Wrong' THEN 1 ELSE 0 END) as wrong_answers,
                COUNT(DISTINCT CASE 
                    WHEN sa.correct_status = 'Correct' 
                    AND EXISTS (
                        SELECT 1 
                        FROM medi_mind_course_levels cl2 
                        JOIN medi_mind_level_mediciens lm2 ON cl2.level_id = lm2.level_id 
                        WHERE cl2.course_code = ? 
                        AND lm2.level_id = sa.level_id 
                        AND lm2.medicine_id = sa.medicine_id
                    )
                    THEN CONCAT(sa.level_id, '-', sa.medicine_id)
                    ELSE NULL 
                END) as unique_correct_tasks
            FROM student_course sc
            JOIN users u ON sc.student_id = u.userid
            LEFT JOIN medi_mind_student_answers sa ON u.username = sa.created_by
            WHERE sc.course_code = ?
            GROUP BY u.userid
            ORDER BY u.fname ASC
        ");
        $stmt->execute([$course_code, $course_code]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Add completion data to each student record
        foreach ($students as &$student) {
            $student['total_medicines_in_batch'] = $totalTasks;
            $student['total_questions_in_batch'] = $totalQuestionsInBatch;
            $student['completion_rate'] = $totalTasks > 0 
                ? round(($student['unique_correct_tasks'] / $totalTasks) * 100, 2) 
                : 0;
            // Map key for frontend compatibility
            $student['unique_correct_medicines'] = $student['unique_correct_tasks'];
        }

        return $students;
    }
}
