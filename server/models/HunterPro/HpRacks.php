<?php

class HpRacks
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM hp_racks");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hp_racks WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO hp_racks (name, is_active, created_by, created_at) 
                VALUES (:name, :is_active, :created_by, :created_at)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE hp_racks SET 
                    name = :name, 
                    is_active = :is_active, 
                    created_by = :created_by, 
                    created_at = :created_at
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM hp_racks WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
