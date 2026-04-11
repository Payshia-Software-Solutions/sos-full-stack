<?php
// models/ceylonPharmacy/CarePaymentAnswer.php

class CarePaymentAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCarePaymentAnswers()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_payment_answer');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCarePaymentAnswerById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_payment_answer WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCarePaymentAnswer($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_payment_answer (student_id, PresCode, answer, created_at, ans_status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['student_id'],
            $data['PresCode'],
            $data['answer'],
            $data['created_at'],
            $data['ans_status']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateCarePaymentAnswer($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_payment_answer SET student_id = ?, PresCode = ?, answer = ?, created_at = ?, ans_status = ? WHERE id = ?');
        $stmt->execute([
            $data['student_id'],
            $data['PresCode'],
            $data['answer'],
            $data['created_at'],
            $data['ans_status'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCarePaymentAnswer($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_payment_answer WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function getCorrectAnswers($presCode, $studentId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `care_payment_answer` WHERE `PresCode` = ? AND `student_id` = ? AND `ans_status` = 'Answer Correct'");
        $stmt->execute([$presCode, $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
