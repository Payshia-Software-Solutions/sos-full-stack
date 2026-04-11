<?php

class MediMindLevel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from medi_mind_levels
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT id, level_name, created_at, created_by FROM medi_mind_levels");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, level_name, created_at, created_by FROM medi_mind_levels WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new record
    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO medi_mind_levels (level_name, created_by, created_at) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['level_name'],
            $data['created_by'],
            date('Y-m-d H:i:s')
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update a record
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE medi_mind_levels SET level_name = ? WHERE id = ?");
        return $stmt->execute([$data['level_name'], $id]);
    }

    // Delete a record
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM medi_mind_levels WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
