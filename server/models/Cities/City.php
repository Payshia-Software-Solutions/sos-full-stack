<?php

class City
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all cities
    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM cities");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Reassign keys using the 'id' column
        $keyedResults = [];
        foreach ($results as $row) {
            $keyedResults[$row['id']] = $row;
        }

        return $keyedResults;
    }

    // Fetch a city by its ID
    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cities WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Fetch cities by district ID
    public function getRecordsByDistrictId($district_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cities WHERE district_id = :district_id");
        $stmt->execute(['district_id' => $district_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Insert a new city
    public function createRecord($data)
    {
        $sql = "INSERT INTO cities 
                (district_id, name_en, name_si, name_ta, sub_name_en, sub_name_si, sub_name_ta, postcode, latitude, longitude) 
                VALUES 
                (:district_id, :name_en, :name_si, :name_ta, :sub_name_en, :sub_name_si, :sub_name_ta, :postcode, :latitude, :longitude)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update an existing city
    public function updateRecord($id, $data)
    {
        $data['id'] = $id;

        $sql = "UPDATE cities SET 
                    district_id = :district_id, 
                    name_en = :name_en, 
                    name_si = :name_si, 
                    name_ta = :name_ta, 
                    sub_name_en = :sub_name_en, 
                    sub_name_si = :sub_name_si, 
                    sub_name_ta = :sub_name_ta, 
                    postcode = :postcode, 
                    latitude = :latitude, 
                    longitude = :longitude 
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a city record
    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM cities WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
