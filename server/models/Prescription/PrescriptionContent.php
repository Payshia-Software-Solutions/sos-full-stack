<?php
// models/Prescription/PrescriptionContent.php

class PrescriptionContent
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllPrescriptionContent()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `prescription_content`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPrescriptionContentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `prescription_content` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createPrescriptionContent($data)
{
    $stmt = $this->pdo->prepare("INSERT INTO `prescription_content` (`pres_code`, `cover_id`, `content`) VALUES (?, ?, ?)");
    $stmt->execute([    
        $data['pres_code'],
        $data['cover_id'],
        $data['content'] 
    ]);
}


    public function updatePrescriptionContent($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `prescription_content` SET `pres_code` = ?, `cover_id` = ?, `content` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['pres_code'],
            $data['cover_id'],
            $data['content'],
            $id
        ]);
    }

    public function deletePrescriptionContent($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `prescription_content` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}