<?php

class HpMedicines
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllMedicines()
    {
        $stmt = $this->pdo->query("SELECT * FROM hp_medicines");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMedicineById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hp_medicines WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createMedicine($data)
    {
        $sql = "INSERT INTO hp_medicines (medicine_name, image_url, dosage_form_id, category_id, drug_type_id, rack_id, is_active, created_by, created_at) 
                VALUES (:medicine_name, :image_url, :dosage_form_id, :category_id, :drug_type_id, :rack_id, :is_active, :created_by, :created_at)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateMedicine($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE hp_medicines SET 
                    medicine_name = :medicine_name, 
                    image_url = :image_url, 
                    dosage_form_id = :dosage_form_id, 
                    category_id = :category_id, 
                    drug_type_id = :drug_type_id, 
                    rack_id = :rack_id, 
                    is_active = :is_active, 
                    created_by = :created_by, 
                    created_at = :created_at
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteMedicine($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM hp_medicines WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
