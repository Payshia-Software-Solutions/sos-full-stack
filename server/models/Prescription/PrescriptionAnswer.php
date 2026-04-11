<?php
// models/Prescription/PrescriptionAnswer.php

class PrescriptionAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllPrescriptionAnswer()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `prescription_answer`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPrescriptionAnswerById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `prescription_answer` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createPrescriptionAnswer($data)
{
    $stmt = $this->pdo->prepare("INSERT INTO `prescription_answer` (`answer_id`, `pres_id`, `cover_id`, `date`, `name`, `drug_name`, `drug_type`, `drug_qty`, `morning_qty`, `afternoon_qty`, `evening_qty`, `night_qty`, `meal_type`, `using_type`, `at_a_time`, `hour_qty`, `additional_description`, `created_at`, `created_by`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([    
        $data['answer_id'],
        $data['pres_id'],
        $data['cover_id'],
        $data['date'],
        $data['name'],
        $data['drug_name'],
        $data['drug_type'],
        $data['drug_qty'],
        $data['morning_qty'],
        $data['afternoon_qty'],
        $data['evening_qty'],
        $data['night_qty'],
        $data['meal_type'],
        $data['using_type'],
        $data['at_a_time'],
        $data['hour_qty'],
        $data['additional_description'],
        $data['created_at'],
        $data['created_by']
        
    ]);
}


    public function updatePrescriptionAnswer($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `prescription_answer` SET `answer_id` = ?, `pres_id` = ?, `cover_id` = ?, `date` = ?, `name` = ?, `drug_name` = ?, `drug_type` = ?, `drug_qty` = ?, `morning_qty` = ?, `afternoon_qty` = ?, `evening_qty` = ?, `night_qty` = ?, `meal_type` = ?, `using_type` = ?, `at_a_time` = ?, `hour_qty` = ?, `additional_description` = ?, `created_at` = ?, `created_by` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['answer_id'],
            $data['pres_id'],
            $data['cover_id'],
            $data['date'],
            $data['name'],
            $data['drug_name'],
            $data['drug_type'],
            $data['drug_qty'],
            $data['morning_qty'],
            $data['afternoon_qty'],
            $data['evening_qty'],
            $data['night_qty'],
            $data['meal_type'],
            $data['using_type'],
            $data['at_a_time'],
            $data['hour_qty'],
            $data['additional_description'],
            $data['created_at'],
            $data['created_by'],
            $id
        ]);
    }

    public function deletePrescriptionAnswer($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `prescription_answer` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}