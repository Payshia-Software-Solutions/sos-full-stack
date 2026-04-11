<?php
// models/ceylonPharmacy/CareSavedAnswers.php

class CareSavedAnswers
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareSavedAnswers()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_saved_answers');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareSavedAnswersById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_saved_answers WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCareSavedAnswers($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_saved_answers (answer_type, answer) VALUES (?, ?)');
        $stmt->execute([
            $data['answer_type'],
            $data['answer']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateCareSavedAnswers($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_saved_answers SET answer_type = ?, answer = ? WHERE id = ?');
        $stmt->execute([
            $data['answer_type'],
            $data['answer'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCareSavedAnswers($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_saved_answers WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
