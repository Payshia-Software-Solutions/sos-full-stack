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
            SELECT l.id, l.level_name, 
                (SELECT COUNT(*) FROM medi_mind_level_mediciens WHERE level_id = l.id) as medicine_count,
                (SELECT COUNT(*) FROM medi_mind_level_questions WHERE level_id = l.id) as question_count
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
                COALESCE(SUM(medicine_count), 0) as total_tasks,
                COALESCE(SUM(medicine_count * question_count), 0) as total_questions_in_batch
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

        // 2. Get all enrolled students for this course
        $stmtStudents = $this->pdo->prepare("
            SELECT 
                u.fname, 
                u.lname, 
                u.username,
                sc.course_code
            FROM student_course sc
            JOIN users u ON sc.student_id = u.userid
            WHERE sc.course_code = ?
            ORDER BY u.fname ASC
        ");
        $stmtStudents->execute([$course_code]);
        $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);

        // 3. Get level IDs assigned to this course
        $stmtLevels = $this->pdo->prepare("SELECT level_id FROM medi_mind_course_levels WHERE course_code = ?");
        $stmtLevels->execute([$course_code]);
        $levelIds = $stmtLevels->fetchAll(PDO::FETCH_COLUMN);

        $progressByUser = [];

        if (!empty($levelIds)) {
            $placeholders = implode(',', array_fill(0, count($levelIds), '?'));
            
            // Fast aggregate query using indexes, avoiding correlated subqueries and table scans
            $stmtProg = $this->pdo->prepare("
                SELECT 
                    sa.created_by,
                    COUNT(sa.id) as total_attempts,
                    SUM(CASE WHEN sa.correct_status = 'Correct' THEN 1 ELSE 0 END) as correct_answers,
                    SUM(CASE WHEN sa.correct_status = 'Wrong' THEN 1 ELSE 0 END) as wrong_answers,
                    COUNT(DISTINCT CASE 
                        WHEN sa.correct_status = 'Correct' THEN CONCAT(sa.level_id, '-', sa.medicine_id) 
                        ELSE NULL 
                    END) as unique_correct_tasks
                FROM medi_mind_student_answers sa
                JOIN medi_mind_level_mediciens lm ON sa.level_id = lm.level_id AND sa.medicine_id = lm.medicine_id
                WHERE sa.level_id IN ($placeholders)
                GROUP BY sa.created_by
            ");
            $stmtProg->execute($levelIds);
            $progRows = $stmtProg->fetchAll(PDO::FETCH_ASSOC);

            foreach ($progRows as $row) {
                $progressByUser[$row['created_by']] = $row;
            }
        }

        // 4. Merge progress into each student record
        foreach ($students as &$student) {
            $uname = $student['username'];
            $prog = isset($progressByUser[$uname]) ? $progressByUser[$uname] : null;

            $uniqueTasks = $prog ? (int)$prog['unique_correct_tasks'] : 0;

            $student['total_attempts'] = $prog ? (int)$prog['total_attempts'] : 0;
            $student['correct_answers'] = $prog ? (int)$prog['correct_answers'] : 0;
            $student['wrong_answers'] = $prog ? (int)$prog['wrong_answers'] : 0;
            $student['unique_correct_tasks'] = $uniqueTasks;
            // Map key for frontend compatibility
            $student['unique_correct_medicines'] = $uniqueTasks;
            $student['total_medicines_in_batch'] = $totalTasks;
            $student['total_questions_in_batch'] = $totalQuestionsInBatch;
            $student['completion_rate'] = $totalTasks > 0 
                ? round(($uniqueTasks / $totalTasks) * 100, 2) 
                : 0;
        }

        return $students;
    }
}
