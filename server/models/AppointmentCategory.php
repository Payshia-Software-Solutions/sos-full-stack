<?php

class AppointmentCategory
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM appointment_category");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM appointment_category WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO appointment_category (category_name, created_at, created_by, last_update, is_active) 
                VALUES (:category_name, :created_at, :created_by, :last_update, :is_active)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $sql = "UPDATE appointment_category SET 
                    category_name = :category_name, 
                    created_by = :created_by, 
                    last_update = :last_update,
                    is_active = :is_active
                WHERE id = :id";
        
        $stmt = $this->pdo->prepare($sql);
    
        $stmt->execute([
            'category_name' => $data['category_name'],
            'created_by' => $data['created_by'],
            'last_update' => $data['last_update'],
            'is_active' => $data['is_active'],
            'id' => $id
        ]);
    }
    

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM appointment_category WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
