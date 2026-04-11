<?php

class MediMindMedicine
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from medi_mind_medicines
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT `id`, `medicine_name`, `medicine_image_url`, `created_by`, `created_at` FROM `medi_mind_medicines`");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `medicine_name`, `medicine_image_url`, `created_by`, `created_at` FROM `medi_mind_medicines` WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new record
    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `medi_mind_medicines` (medicine_name, medicine_image_url, created_by, created_at) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['medicine_name'],
            $data['medicine_image_url'],
            $data['created_by'],
            date('Y-m-d H:i:s')
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update a record
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `medi_mind_medicines` SET medicine_name = ?, medicine_image_url = ? WHERE id = ?");
        return $stmt->execute([$data['medicine_name'], $data['medicine_image_url'], $id]);
    }

    // Delete a record
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `medi_mind_medicines` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
