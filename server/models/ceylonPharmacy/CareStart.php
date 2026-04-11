<?php
// models/ceylonPharmacy/CareStart.php

class CareStart
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareStarts()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_start');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareStartById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_start WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCareStartByStudentIdAndPresCode($student_id, $PresCode)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_start WHERE student_id = ? AND PresCode = ?');
        $stmt->execute([$student_id, $PresCode]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCareStart($data)
    {
        $createdAt = date('Y-m-d H:i:s');
        $currentTime = date('Y-m-d H:i:s');
        $stmt = $this->pdo->prepare('INSERT INTO care_start (student_id, PresCode, time, created_at, patient_status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['student_id'],
            $data['PresCode'],
            $currentTime,
            $createdAt,
            $data['patient_status']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateCareStart($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_start SET student_id = ?, PresCode = ?, time = ?, created_at = ?, patient_status = ? WHERE id = ?');
        $stmt->execute([
            $data['student_id'],
            $data['PresCode'],
            $data['time'],
            $data['created_at'],
            $data['patient_status'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCareStart($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_start WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function updatePatientStatus($id, $patientStatus)
    {
        $stmt = $this->pdo->prepare('UPDATE care_start SET patient_status = ? WHERE id = ?');
        $stmt->execute([$patientStatus, $id]);
        return $stmt->rowCount();
    }

    public function updatePatientStatusStudentAndPatient($student_id, $patient_id, $patientStatus)
    {
        $stmt = $this->pdo->prepare('UPDATE care_start SET patient_status = ? WHERE student_id = ? AND PresCode = ?');
        $stmt->execute([$patientStatus, $student_id, $patient_id]);
        return $stmt->rowCount();
    }
}
