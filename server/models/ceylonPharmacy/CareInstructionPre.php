<?php
// models/ceylonPharmacy/CareInstructionPre.php

class CareInstructionPre
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_instruction_pre ORDER BY id');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_instruction_pre WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_instruction_pre (instruction, created_by) VALUES (?, ?)');
        $stmt->execute([
            $data['instruction'],
            $data['created_by']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_instruction_pre SET instruction = ? WHERE id = ?');
        $stmt->execute([
            $data['instruction'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_instruction_pre WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
