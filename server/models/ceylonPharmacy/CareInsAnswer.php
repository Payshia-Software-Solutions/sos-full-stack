<?php
// models/ceylonPharmacy/CareInsAnswer.php

class CareInsAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_ins_answer');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_ins_answer WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_ins_answer (LoggedUser, PresCode, Instruction, CoverCode, ans_status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['LoggedUser'],
            $data['PresCode'],
            $data['Instruction'],
            $data['CoverCode'],
            $data['ans_status']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_ins_answer SET LoggedUser = ?, PresCode = ?, Instruction = ?, CoverCode = ?, ans_status = ? WHERE id = ?');
        $stmt->execute([
            $data['LoggedUser'],
            $data['PresCode'],
            $data['Instruction'],
            $data['CoverCode'],
            $data['ans_status'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_ins_answer WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function findCorrectSubmission($studentNumber, $presCode, $coverCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM care_ins_answer WHERE LoggedUser = ? AND PresCode = ? AND CoverCode = ? AND ans_status = 'Correct'");
        $stmt->execute([$studentNumber, $presCode, $coverCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
