<?php
// models/ConvocationMedalType.php

class ConvocationMedalType
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllMedalTypes($activeOnly = false)
    {
        $sql = "SELECT * FROM `convocation_medal_types`";
        if ($activeOnly) {
            $sql .= " WHERE `is_active` = 1";
        }
        $sql .= " ORDER BY `id` ASC";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMedalTypeById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `convocation_medal_types` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createMedalType($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `convocation_medal_types` (`name`, `description`, `color`, `is_active`) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['description'] ?? null,
            $data['color'] ?? 'gold',
            isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateMedalType($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `convocation_medal_types` SET `name` = ?, `description` = ?, `color` = ?, `is_active` = ? WHERE `id` = ?");
        return $stmt->execute([
            $data['name'],
            $data['description'] ?? null,
            $data['color'] ?? 'gold',
            isset($data['is_active']) ? (int)$data['is_active'] : 1,
            $id
        ]);
    }

    public function deleteMedalType($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `convocation_medal_types` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }
}
