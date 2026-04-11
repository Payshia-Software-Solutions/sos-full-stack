<?php
// models/EnWordSubmission.php

class EnWordSubmission
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Create new submission
    public function createSubmission($word_id, $student_number, $atttempt_value, $correct_status, $created_by)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO en_word_submission (word_id, student_number, atttempt_value, correct_status, created_by)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$word_id, $student_number, $atttempt_value, $correct_status, $created_by]);
        return $this->pdo->lastInsertId();
    }

    // Get all submissions
    public function getAllSubmissions()
    {
        $stmt = $this->pdo->query("SELECT * FROM en_word_submission");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get submission by ID
    public function getSubmissionById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM en_word_submission WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get submissions by student number
    public function getSubmissionsByStudent($student_number)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM en_word_submission WHERE student_number = ?");
        $stmt->execute([$student_number]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get submissions by student number with grades
    public function getCorrectAndIncorrectCounts($student_number)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            SUM(CASE WHEN correct_status = 'Correct' THEN 1 ELSE 0 END) AS correct_count,
            SUM(CASE WHEN correct_status = 'Incorrect' THEN 1 ELSE 0 END) AS incorrect_count
        FROM en_word_submission
        WHERE student_number = ?
    ");
        $stmt->execute([$student_number]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function getCorrectSubmissionsByStudent($studentNumber)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM en_word_submission WHERE student_number = ? AND correct_status = 'Correct'");
        $stmt->execute([$studentNumber]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Delete a submission
    public function deleteSubmission($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM en_word_submission WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
