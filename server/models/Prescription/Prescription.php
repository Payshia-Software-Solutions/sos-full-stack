<?php
// models/Prescription/Prescription.php

class Prescription
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllPrescription()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `prescription`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPrescriptionById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `prescription` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createPrescription($data)
{
    $stmt = $this->pdo->prepare("INSERT INTO `prescription` (`prescription_id`, `prescription_name`, `prescription_status`, `created_at`, `created_by`, `Pres_Name`, `pres_date`, `Pres_Age`, `Pres_Method`, `doctor_name`, `notes`, `drugs_list`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['prescription_id'],
        $data['prescription_name'],
        $data['prescription_status'],
        $data['created_at'],
        $data['created_by'],
        $data['Pres_Name'],
        $data['pres_date'],
        $data['Pres_Age'],
        $data['Pres_Method'],
        $data['doctor_name'],
        $data['notes'],
        $data['drugs_list']
    ]);
}


    public function updatePrescription($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `prescription` SET `prescription_id` = ?, `prescription_name` = ?, `prescription_status` = ?, `created_at` = ?, `created_by` = ?, `Pres_Name` = ?, `pres_date` = ?, `Pres_Age` = ?, `Pres_Method` = ?, `doctor_name` = ?, `notes` = ?, `drugs_list` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['prescription_id'],
            $data['prescription_name'],
            $data['prescription_status'],
            $data['created_at'],
            $data['created_by'],
            $data['Pres_Name'],
            $data['pres_date'],
            $data['Pres_Age'],
            $data['Pres_Method'],
            $data['doctor_name'],
            $data['notes'],
            $data['drugs_list'],
            $id
        ]);
    }

    public function deletePrescription($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `prescription` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}