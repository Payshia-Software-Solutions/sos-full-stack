<?php
// models/Assignment/AssignmentSubmission.php

class AssignmentSubmission
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllSubmissions()
    {
        $stmt = $this->pdo->query("SELECT * FROM assignment_submittion");
        return $stmt->fetchAll();
    }

    public function getSubmissionById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM assignment_submittion WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getAverageGradeByStudentAndCourse($studentId, $parentCourseId)
    {
        /*  ──────────────────────────────────────────────────────────────────────────
        ranked  → one row per submission, ranked so rn = 1 is the *latest* one
        dedup   → collapses to the latest grade for every assignment
        avg_grade → averages those grades per course
    ────────────────────────────────────────────────────────────────────────── */
        $sql = "
WITH ranked AS (
    SELECT
        a.course_code,
        a.assignment_id,
        asub.grade,
        ROW_NUMBER() OVER (
            PARTITION BY a.assignment_id
            ORDER BY            -- newest first
                  asub.id        DESC         -- (or asub.submitted_at DESC)
        ) AS rn
    FROM assignment a
    JOIN student_course sc
           ON a.course_code = sc.course_code
    JOIN users u
           ON sc.student_id = u.userid
    LEFT JOIN assignment_submittion asub
           ON  asub.assignment_id = a.assignment_id
           AND asub.created_by   = u.username
    WHERE u.username = ?
),
dedup AS (
    SELECT course_code, grade
    FROM   ranked
    WHERE  rn = 1                -- keep only the latest submission
),
avg_grade AS (
    SELECT
        course_code,
        ROUND(AVG(grade), 2) AS average_grade
    FROM dedup
    GROUP BY course_code
)
SELECT
    c.course_name,
    c.parent_course_id,
    c.course_code,
    ag.average_grade
FROM avg_grade ag
JOIN course c
      ON c.course_code = ag.course_code
WHERE c.parent_course_id = ?;
";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$studentId, $parentCourseId]);   // 1 = username, 2 = parent course
        return $stmt->fetch(PDO::FETCH_ASSOC);           // use fetchAll() if you need many rows
    }



    public function getAllSubmissionsGroupedByStudent()
    {
        $stmt = $this->pdo->query("SELECT assignment_id, file_path, created_by, created_at, status, grade FROM assignment_submittion");
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group by student number (created_by)
        $grouped = [];
        foreach ($submissions as $submission) {
            $studentId = $submission['created_by'];
            $assignmentId = $submission['assignment_id'];
            $grouped[$studentId][$assignmentId] = $submission; // or just $submission['grade'] if needed
        }

        return $grouped;
    }

    public function getSubmissionsByAssignmentId($assignmentId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM assignment_submittion WHERE assignment_id = ?");
        $stmt->execute([$assignmentId]);
        return $stmt->fetchAll();
    }


    public function getSubmissionsByStudentNumber($studentNumber)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM assignment_submittion WHERE created_by = ?");
        $stmt->execute([$studentNumber]);

        $resultArray = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $resultArray[$row['assignment_id']] = $row;
        }

        return $resultArray;
    }

    public function createSubmission($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO assignment_submittion (assignment_id, file_path, created_by, created_at, status, grade) VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['assignment_id'],
            $data['file_path'],
            $data['created_by'],
            $data['created_at'],
            $data['status'],
            $data['grade']
        ]);
    }

    public function updateSubmission($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE assignment_submittion SET assignment_id = ?, file_path = ?, created_by = ?, created_at = ?, status = ?, grade = ? WHERE id = ?");
        return $stmt->execute([
            $data['assignment_id'],
            $data['file_path'],
            $data['created_by'],
            $data['created_at'],
            $data['status'],
            $data['grade'],
            $id
        ]);
    }

    public function deleteSubmission($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM assignment_submittion WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
