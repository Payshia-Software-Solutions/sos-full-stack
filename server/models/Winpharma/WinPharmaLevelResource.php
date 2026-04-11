<?php
// models/Winpharma/WinPharmaLevelResource.php

class WinPharmaLevelResource
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllWinPharmaLevelResources()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_level_resources`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getWinPharmaLevelResourceById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_level_resources` WHERE `resource_id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createWinPharmaLevelResource($data)
    {
        $data = is_array($data) ? $data : [];
        $stmt = $this->pdo->prepare("INSERT INTO `win_pharma_level_resources` 
        (`level_id`, `resource_title`, `resource_data`, `created_by`, `task_cover`, `video_url`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['level_id'] ?? null,
            $data['resource_title'] ?? null,
            $data['resource_data'] ?? '',
            $data['created_by'] ?? 'System',
            $data['task_cover'] ?? null,
            $data['video_url'] ?? null,
            $data['is_active'] ?? 1
        ]);
    }

    public function updateWinPharmaLevelResource($id, $data)
    {
        $data = is_array($data) ? $data : [];
        $stmt = $this->pdo->prepare("UPDATE `win_pharma_level_resources` SET `level_id` = ?, `resource_title` = ?, `resource_data` = ?, `created_by` = ?, `task_cover` = ?, `video_url` = ?, `is_active` = ? WHERE `resource_id` = ?");
        $stmt->execute([
            $data['level_id'] ?? null,
            $data['resource_title'] ?? null,
            $data['resource_data'] ?? '',
            $data['created_by'] ?? 'System',
            $data['task_cover'] ?? null,
            $data['video_url'] ?? null,
            $data['is_active'] ?? 1,
            $id
        ]);
    }

    public function deleteWinPharmaLevelResource($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `win_pharma_level_resources` WHERE `resource_id` = ?");
        $stmt->execute([$id]);
    }

    public function getWinPharmaLevelResourcesByLevel($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `win_pharma_level_resources` WHERE `level_id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
