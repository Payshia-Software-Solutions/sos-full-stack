<?php
// models/Care/CareInstructionPre.php

class CareInstructionPre
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareInstructions()
    {
        $stmt = $this->pdo->query("SELECT * FROM care_instruction_pre");
        return $stmt->fetchAll();
    }

    public function getCareInstructionById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM care_instruction_pre WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function createCareInstruction($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO care_instruction_pre (created_by, instruction) VALUES (?, ?)");
        return $stmt->execute([
            $data['created_by'],
            $data['instruction']
        ]);
    }

    public function updateCareInstruction($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE care_instruction_pre SET created_by = ?, instruction = ? WHERE id = ?");
        return $stmt->execute([
            $data['created_by'],
            $data['instruction'],
            $id
        ]);
    }

    public function deleteCareInstruction($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM care_instruction_pre WHERE id = ?");
        return $stmt->execute([$id]);
    }
}