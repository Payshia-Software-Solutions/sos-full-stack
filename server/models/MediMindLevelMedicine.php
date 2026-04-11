<?php

class MediMindLevelMedicine
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from medi_mind_level_mediciens
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT 
                lm.id, 
                lm.level_id, 
                lm.medicine_id, 
                lm.created_by, 
                lm.created_at,
                l.level_name,
                m.medicine_name
            FROM 
                medi_mind_level_mediciens lm
            LEFT JOIN 
                medi_mind_levels l ON lm.level_id = l.id
            LEFT JOIN 
                medi_mind_medicines m ON lm.medicine_id = m.id
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                lm.id, 
                lm.level_id, 
                lm.medicine_id, 
                lm.created_by, 
                lm.created_at,
                l.level_name,
                m.medicine_name
            FROM 
                medi_mind_level_mediciens lm
            LEFT JOIN 
                medi_mind_levels l ON lm.level_id = l.id
            LEFT JOIN 
                medi_mind_medicines m ON lm.medicine_id = m.id
            WHERE 
                lm.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get all medicines for a specific level ID
    public function getByLevel($levelId)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                lm.id, 
                lm.level_id, 
                lm.medicine_id, 
                m.medicine_name
            FROM 
                medi_mind_level_mediciens lm
            JOIN 
                medi_mind_medicines m ON lm.medicine_id = m.id
            WHERE 
                lm.level_id = ?
        ");
        $stmt->execute([$levelId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create a new level-medicine mapping
    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `medi_mind_level_mediciens` 
                (level_id, medicine_id, created_by, created_at) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['level_id'],
            $data['medicine_id'],
            $data['created_by'],
            date('Y-m-d H:i:s')
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update a record
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE `medi_mind_level_mediciens` 
            SET level_id = ?, medicine_id = ? 
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['level_id'], 
            $data['medicine_id'], 
            $id
        ]);
    }

    // Delete a record
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `medi_mind_level_mediciens` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
