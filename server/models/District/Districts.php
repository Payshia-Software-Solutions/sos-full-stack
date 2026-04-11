<?php

class Districts
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all districts
    public function getAllDistricts()
    {
        $stmt = $this->pdo->query("SELECT id, province_id, name_en, name_si, name_ta FROM districts");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single district by ID
    public function getDistrictById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, province_id, name_en, name_si, name_ta FROM districts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Fetch districts by province_id
    public function getDistrictsByProvinceId($provinceId)
    {
        $stmt = $this->pdo->prepare("SELECT id, province_id, name_en, name_si, name_ta FROM districts WHERE province_id = :province_id");
        $stmt->execute(['province_id' => $provinceId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create a new district record
    public function createDistrict($data)
    {
        $sql = "INSERT INTO districts (province_id, name_en, name_si, name_ta) 
                VALUES (:province_id, :name_en, :name_si, :name_ta)";
        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            'province_id' => $data['province_id'],
            'name_en' => $data['name_en'],
            'name_si' => $data['name_si'],
            'name_ta' => $data['name_ta'],
        ]);
    }

    // Update an existing district record by ID
    public function updateDistrict($id, $data)
    {
        $sql = "UPDATE districts SET 
                    province_id = :province_id, 
                    name_en = :name_en, 
                    name_si = :name_si, 
                    name_ta = :name_ta 
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            'id' => $id,
            'province_id' => $data['province_id'],
            'name_en' => $data['name_en'],
            'name_si' => $data['name_si'],
            'name_ta' => $data['name_ta'],
        ]);
    }

    // Delete a district record by ID
    public function deleteDistrict($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM districts WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
