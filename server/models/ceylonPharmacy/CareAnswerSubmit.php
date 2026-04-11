<?php
// server/models/ceylonPharmacy/CareAnswerSubmit.php

class CareAnswerSubmit
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareAnswerSubmits()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_answer_submit ORDER BY created_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareAnswerSubmitById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_answer_submit WHERE answer_id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCareAnswerSubmit($data)
    {
        $columns = '`' . implode('`, `', array_keys($data)) . '`';
        $placeholders = ':' . implode(', :', array_keys($data));
        $sql = "INSERT INTO `care_answer_submit` ($columns) VALUES ($placeholders)";
        $stmt = $this->pdo->prepare($sql);
        if ($stmt->execute($data)) {
            return $this->pdo->lastInsertId();
        }
        return false;
    }
    
    public function generateNewAnswerId()
    {
        $stmt = $this->pdo->query("SELECT COUNT(id) as count FROM care_answer_submit");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = $row ? (int)$row['count'] : 0;
        return "UA" . ($count + 1);
    }
    
    public function updateCareAnswerSubmit($id, $data)
    {
        $setPart = [];
        foreach ($data as $key => $value) {
            $setPart[] = "`$key` = :$key";
        }
        $sql = "UPDATE care_answer_submit SET " . implode(', ', $setPart) . " WHERE id = :id";
        $data['id'] = $id;
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);
    }

    public function deleteCareAnswerSubmit($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_answer_submit WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function findCorrectSubmission($coverId, $presId, $studentId)
    {
        $stmt = $this->pdo->prepare('SELECT `answer_id` FROM `care_answer_submit` WHERE `cover_id` = ? AND `pres_id` = ? AND `answer_status` = \'Correct\' AND `created_by` = ?');
        $stmt->execute([$coverId, $presId, $studentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
