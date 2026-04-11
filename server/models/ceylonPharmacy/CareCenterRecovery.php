<?php
// models/ceylonPharmacy/CareCenterRecovery.php

class CareCenterRecovery
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareCenterRecoveries()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_center_recovery');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareCenterRecoveryById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_center_recovery WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCareCenterRecoveriesByStudentNumber($studentNumber)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_center_recovery WHERE student_number = ?');
        $stmt->execute([$studentNumber]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createCareCenterRecovery($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_center_recovery (student_number, patient_id, created_at) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['student_number'],
            $data['patient_id'],
            date('Y-m-d H:i:s')
        ]);
        $lastId = $this->pdo->lastInsertId();

        if ($lastId) {
            $stmt = $this->pdo->prepare('DELETE FROM care_start WHERE student_id = ? AND PresCode = ?');
            $stmt->execute([
                $data['student_number'],
                $data['patient_id']
            ]);
        }

        return $lastId;
    }

    public function updateCareCenterRecovery($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_center_recovery SET student_number = ?, patient_id = ? WHERE id = ?');
        $stmt->execute([
            $data['student_number'],
            $data['patient_id'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCareCenterRecovery($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_center_recovery WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
