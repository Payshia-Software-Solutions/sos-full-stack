<?php

class HunterSaveAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM hunter_saveanswer");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hunter_saveanswer WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO hunter_saveanswer (index_number, category_id, medicine_id, rack_id, dosage_id, answer_status, score, score_type, attempts) 
                VALUES (:index_number, :category_id, :medicine_id, :rack_id, :dosage_id, :answer_status, :score, :score_type, :attempts)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE hunter_saveanswer SET 
                    index_number = :index_number, 
                    category_id = :category_id,
                    medicine_id = :medicine_id,
                    rack_id = :rack_id,
                    dosage_id = :dosage_id,
                    answer_status = :answer_status,
                    score = :score,
                    score_type = :score_type,
                    attempts = :attempts
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM hunter_saveanswer WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function getHunterSavedAnswers()
    {
        // SQL query to retrieve answers for all users
        $sql = "SELECT 
                `index_number`, 
                SUM(CASE WHEN `answer_status` LIKE 'Correct' THEN 1 ELSE 0 END) AS `correct_count`, 
                SUM(CASE WHEN `answer_status` LIKE 'Wrong' THEN 1 ELSE 0 END) AS `incorrect_count`, 
                SUM(CASE WHEN `answer_status` LIKE 'Correct' AND `score_type` LIKE 'Jem' THEN 1 ELSE 0 END) AS `gem_count`, 
                SUM(CASE WHEN `answer_status` LIKE 'Correct' AND `score_type` LIKE 'Coin' THEN 1 ELSE 0 END) AS `coin_count` 
            FROM 
                `hunter_saveanswer` 
            GROUP BY 
                `index_number`";

        // Prepare the statement
        $stmt = $this->pdo->prepare($sql);

        // Execute the statement
        $stmt->execute();

        // Fetch all results
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Initialize the result array
        $ArrayResult = [];

        // If results are found, add them to the result array
        if ($results) {
            foreach ($results as $row) {
                $ArrayResult[$row['index_number']] = $row;
            }
        }

        // Return the results
        return $ArrayResult;
    }

    public function HunterSavedAnswersByUser($studentNumber)
    {
        // SQL query to retrieve answers by user
        $sql = "SELECT 
                `index_number`, 
                SUM(CASE WHEN `answer_status` LIKE 'Correct' THEN 1 ELSE 0 END) AS `correct_count`, 
                SUM(CASE WHEN `answer_status` LIKE 'Wrong' THEN 1 ELSE 0 END) AS `incorrect_count`, 
                SUM(CASE WHEN `answer_status` LIKE 'Correct' AND `score_type` LIKE 'Jem' THEN 1 ELSE 0 END) AS `gem_count`, 
                SUM(CASE WHEN `answer_status` LIKE 'Correct' AND `score_type` LIKE 'Coin' THEN 1 ELSE 0 END) AS `coin_count` 
            FROM 
                `hunter_saveanswer` 
            WHERE
                `index_number` = :studentNumber
            GROUP BY
                `index_number`";

        // Prepare the statement
        $stmt = $this->pdo->prepare($sql);

        // Bind the student number parameter
        $stmt->bindParam(':studentNumber', $studentNumber, PDO::PARAM_STR);

        // Execute the statement
        $stmt->execute();

        // Fetch all results
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Initialize the result array
        $ArrayResult = [];

        // If results are found, add them to the result array
        if ($results) {
            foreach ($results as $row) {
                $ArrayResult[$row['index_number']] = $row;
            }
        }

        // Return the results
        return $ArrayResult;
    }
}
