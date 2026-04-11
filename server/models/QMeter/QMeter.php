<?php
// models/QMeter/QMeter.php

class QMeter
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllQMeters()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `q-meter`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getQMeterById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `q-meter` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createQMeter($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `q-meter` (`quest_id`, `main_id`, `quest_no`, `question`, `answer_1`, `answer_2`, `answer_3`, `answer_4`, `correct_answer`, `quest_stat`, `created_at`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['quest_id'],
            $data['main_id'],
            $data['quest_no'],
            $data['question'],
            $data['answer_1'],
            $data['answer_2'],
            $data['answer_3'],
            $data['answer_4'],
            $data['correct_answer'],
            $data['quest_stat'],
            $data['created_at']
        ]);
    }

    public function updateQMeter($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `q-meter` SET `quest_id` = ?, `main_id` = ?, `quest_no` = ?, `question` = ?, `answer_1` = ?, `answer_2` = ?, `answer_3` = ?, `answer_4` = ?, `correct_answer` = ?, `quest_stat` = ?, `created_at` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['quest_id'],
            $data['main_id'],
            $data['quest_no'],
            $data['question'],
            $data['answer_1'],
            $data['answer_2'],
            $data['answer_3'],
            $data['answer_4'],
            $data['correct_answer'],
            $data['quest_stat'],
            $data['created_at'],
            $id
        ]);
    }

    public function deleteQMeter($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `q-meter` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
?>
