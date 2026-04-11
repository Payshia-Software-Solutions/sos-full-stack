<?php

class DeliverySetting
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all delivery settings
    public function getAll()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `delivery_setting`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get delivery setting by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `delivery_setting` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByCourseId($courseId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `delivery_setting` WHERE `course_id` = ?");
        $stmt->execute([$courseId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create new delivery setting
    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `delivery_setting` (`course_id`, `delivery_title`, `is_active`, `icon`, `value`) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['course_id'],
            $data['delivery_title'],
            $data['is_active'],
            $data['icon'],
            $data['value']
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update existing delivery setting
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `delivery_setting` SET `course_id` = ?, `delivery_title` = ?, `is_active` = ?, `icon` = ?, `value` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['course_id'],
            $data['delivery_title'],
            $data['is_active'],
            $data['icon'],
            $data['value'],
            $id
        ]);
    }

    // Delete a delivery setting
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `delivery_setting` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
