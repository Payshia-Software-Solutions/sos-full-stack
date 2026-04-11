<?php
// models/QMeter/QMeterSubmit.php

class QMeterSubmit
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllQMeterSubmits()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `q-meter-submits`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getQMeterSubmitById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `q-meter-submits` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createQMeterSubmit($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `q-meter-submits` (`date`, `user_id`, `q_id`, `main_id`, `answer_selected`, `mark`, `attempts`, `attempt_stat`, `created_at`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['date'],
            $data['user_id'],
            $data['q_id'],
            $data['main_id'],
            $data['answer_selected'],
            $data['mark'],
            $data['attempts'],
            $data['attempt_stat'],
            $data['created_at']
        ]);
    }

    public function updateQMeterSubmit($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `q-meter-submits` SET `date` = ?, `user_id` = ?, `q_id` = ?, `main_id` = ?, `answer_selected` = ?, `mark` = ?, `attempts` = ?, `attempt_stat` = ?, `created_at` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['date'],
            $data['user_id'],
            $data['q_id'],
            $data['main_id'],
            $data['answer_selected'],
            $data['mark'],
            $data['attempts'],
            $data['attempt_stat'],
            $data['created_at'],
            $id
        ]);
    }

    public function deleteQMeterSubmit($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `q-meter-submits` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
