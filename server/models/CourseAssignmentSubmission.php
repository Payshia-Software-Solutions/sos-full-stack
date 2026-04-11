<?php
// models/CourseAssignmentSubmission.php

class CourseAssignmentSubmission
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllSubmissions()
    {
        $stmt = $this->pdo->query('SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status FROM course_assignments_submissions');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSubmissionsByCourse($course_code)
    {
        $stmt = $this->pdo->prepare('SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status FROM course_assignments_submissions WHERE course_code = :course_code');
        $stmt->bindParam(':course_code', $course_code, PDO::PARAM_STR);  // Use PDO::PARAM_STR for string values
        $stmt->execute();

        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Create an indexed array based on created_by and assignment_id
        $indexedSubmissions = [];
        foreach ($submissions as $submission) {
            $key = $submission['created_by'] . '_' . $submission['assignment_id'];
            $indexedSubmissions[$key] = $submission;
        }

        return $indexedSubmissions;
    }

    public function getSubmissionsByUser($username)
    {
        $stmt = $this->pdo->prepare('SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status FROM course_assignments_submissions WHERE created_by = ?');
        $stmt->execute([$username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSubmissionByUser($username, $id)
    {
        $stmt = $this->pdo->prepare('SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status FROM course_assignments_submissions WHERE created_by = ? AND id = ?');
        $stmt->execute([$username, $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getSubmissionByUserAndAssignment($username, $assignment_id)
    {
        $stmt = $this->pdo->prepare('SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status FROM course_assignments_submissions WHERE created_by = ? AND assignment_id = ?');
        $stmt->execute([$username, $assignment_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getSubmissionById($id)
    {
        $stmt = $this->pdo->prepare('SELECT id, assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status FROM course_assignments_submissions WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createSubmission($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO course_assignments_submissions (assignment_id, course_code, created_by, created_at, is_active, updated_at, file_list, grade, grade_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['assignment_id'],
            $data['course_code'],
            $data['created_by'],
            $data['created_at'],
            $data['is_active'],
            $data['updated_at'],
            $data['file_list'],
            $data['grade'],
            $data['grade_status']
        ]);
    }

    public function updateSubmission($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE course_assignments_submissions SET assignment_id = ?, course_code = ?, created_by = ?, created_at = ?, is_active = ?, updated_at = ?, file_list = ?, grade = ?, grade_status = ? WHERE id = ?');
        $stmt->execute([
            $data['assignment_id'],
            $data['course_code'],
            $data['created_by'],
            $data['created_at'],
            $data['is_active'],
            $data['updated_at'],
            $data['file_list'],
            $data['grade'],
            $data['grade_status'],
            $id
        ]);
    }

    public function deleteSubmission($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM course_assignments_submissions WHERE id = ?');
        $stmt->execute([$id]);
    }
}
