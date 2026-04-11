<?php
// models/Winpharma/WinpharmaCommonReason.php

class WinpharmaCommonReason
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllWinpharmaCommonReasons()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `winpharma_common_resons`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getWinpharmaCommonReasonById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `winpharma_common_resons` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createWinpharmaCommonReason($data)
{
    $stmt = $this->pdo->prepare("INSERT INTO `winpharma_common_resons` (`reason`, `is_active`, `created_by`, `created_at`) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['reason'],
        $data['is_active'],
        $data['created_by'],
        $data['created_at']
    ]);
}


    public function updateWinpharmaCommonReason($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `winpharma_common_resons` SET `reason` = ?, `is_active` = ?, `created_by` = ?, `created_at` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['reason'],
            $data['is_active'],
            $data['created_by'],
            $data['created_at'],
            $id
        ]);
    }

    public function deleteWinpharmaCommonReason($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `winpharma_common_resons` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}