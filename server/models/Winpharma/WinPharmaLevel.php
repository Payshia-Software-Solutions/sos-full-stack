<?php
// models/Winpharma/WinPharmaLevel.php

class WinPharmaLevel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllWinPharmaLevels()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_level`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getWinPharmaLevelById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_level` WHERE `level_id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createWinPharmaLevel($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `win_pharma_level` (`course_code`, `level_name`, `is_active`, `created_at`, `created_by`) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['course_code'],
            $data['level_name'],
            $data['is_active'],
            $data['created_at'],
            $data['created_by']
        ]);
    }

    public function updateWinPharmaLevel($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `win_pharma_level` SET `course_code` = ?, `level_name` = ?, `is_active` = ?, `created_at` = ?, `created_by` = ? WHERE `level_id` = ?");
        $stmt->execute([
            $data['course_code'],
            $data['level_name'],
            $data['is_active'],
            $data['created_at'],
            $data['created_by'],
            $id
        ]);
    }

    public function deleteWinPharmaLevel($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `win_pharma_level` WHERE `level_id` = ?");
        $stmt->execute([$id]);
    }

    public function getWinPharmaLevelsByCourse($courseCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_level` WHERE `course_code` = ?");
        $stmt->execute([$courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}