<?php
// models/QMeter/QMeterOpen.php

class QMeterOpen
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllQMeterOpen()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `q-meter-open`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getQMeterOpenById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `q-meter-open` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createQMeterOpen($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `q-meter-open` (`quest_id`, `d_id`, `user_id`, `created_at`) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['quest_id'],
            $data['d_id'],
            $data['user_id'],
            $data['created_at']
        ]);
    }

    public function updateQMeterOpen($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `q-meter-open` SET `quest_id` = ?, `d_id` = ?, `user_id` = ?, `created_at` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['quest_id'],
            $data['d_id'],
            $data['user_id'],
            $data['created_at'],
            $id
        ]);
    }

    public function deleteQMeterOpen($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `q-meter-open` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
?>
