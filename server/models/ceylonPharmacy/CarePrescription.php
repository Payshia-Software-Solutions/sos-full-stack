<?php
// models/ceylonPharmacy/CarePrescription.php

class CarePrescription
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCarePrescriptions()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_prescription');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCarePrescriptionById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_prescription WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCarePrescription($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_prescription (PresCode, dr_id, student_id, status, created_at) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['PresCode'],
            $data['dr_id'],
            $data['student_id'],
            $data['status'],
            $data['created_at']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateCarePrescription($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_prescription SET PresCode = ?, dr_id = ?, student_id = ?, status = ?, created_at = ? WHERE id = ?');
        $stmt->execute([
            $data['PresCode'],
            $data['dr_id'],
            $data['student_id'],
            $data['status'],
            $data['created_at'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCarePrescription($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_prescription WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
