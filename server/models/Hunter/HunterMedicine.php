<?php

class HunterMedicine
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM hunter_medicine");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hunter_medicine WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO hunter_medicine (category_id, product_code, medicine_name, file_path, active_status, created_by) 
                VALUES (:category_id, :product_code, :medicine_name, :file_path, :active_status, :created_by)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE hunter_medicine SET 
                    category_id = :category_id, 
                    product_code = :product_code,
                    medicine_name = :medicine_name,
                    file_path = :file_path,
                    active_status = :active_status,
                    created_by = :created_by
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM hunter_medicine WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function HunterMedicines()
    {
        $sql = "SELECT * FROM `hunter_medicine` WHERE `active_status` NOT LIKE 'Deleted'";
        $stmt = $this->pdo->query($sql);
        $ArrayResult = [];

        if ($stmt->rowCount() > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $ArrayResult[$row['id']] = $row;
            }
        }
        return $ArrayResult;
    }
}
