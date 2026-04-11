<?php
// models/ceylonPharmacy/CareAnswer.php

class CareAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from the care_answer table
    public function getAllCareAnswers()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_answer');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by its primary key
    public function getCareAnswerById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_answer WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Get the correct answer record for validation purposes
    public function getAnswerByPrescriptionAndCover($presId, $coverId)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_answer WHERE pres_id = ? AND cover_id = ?');
        $stmt->execute([$presId, $coverId]);

        // Use fetch() instead of fetchAll() to return a single associative array
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAnswersByPrescriptionAndCover($presId, $coverId) 
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_answer WHERE pres_id = ? AND cover_id = ?');
        $stmt->execute([$presId, $coverId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getDistinctNames()
    {
        $stmt = $this->pdo->query('SELECT DISTINCT name FROM care_answer');
        return $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    }

    public function getFormSelectionData()
    {
        // Initialize the structure for the selection data
        $selectionData = [
            'name' => [],
            'drug_name' => [],
            'drug_type' => [],
            'drug_qty' => [],
            'morning_qty' => [],
            'afternoon_qty' => [],
            'evening_qty' => [],
            'night_qty' => [],
            'meal_type' => [],
            'using_type' => [],
            'at_a_time' => [],
            'hour_qty' => [],
            'additional_description' => [],
        ];

        // Fetch all saved answers
        $stmt = $this->pdo->query("SELECT answer_type, answer FROM care_saved_answers WHERE answer IS NOT NULL AND answer != ''");
        $savedAnswers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Define the mapping from answer_type to the selectionData key
        $mapping = [
            'Name' => 'name',
            'DrugName' => 'drug_name',
            'DosageForm' => 'drug_type',
            'MealType' => 'meal_type',
            'UsingType' => 'using_type',
            'Additional' => 'additional_description',
        ];

        $quantityKeys = [
            'drug_qty', 'morning_qty', 'afternoon_qty', 'evening_qty', 'night_qty', 'at_a_time', 'hour_qty'
        ];

        // Process the fetched answers and populate the selectionData
        foreach ($savedAnswers as $row) {
            $answerType = str_replace(' ', '', $row['answer_type']); // Remove spaces
            $answer = $row['answer'];

            if ($answerType === 'Quantity') {
                foreach ($quantityKeys as $key) {
                    if (!in_array($answer, $selectionData[$key])) {
                        $selectionData[$key][] = $answer;
                    }
                }
            } else if (isset($mapping[$answerType])) {
                $key = $mapping[$answerType];
                // Add the answer if it's not already in the list
                if (!in_array($answer, $selectionData[$key])) {
                    $selectionData[$key][] = $answer;
                }
            }
        }

        // Sort the arrays for consistent ordering
        foreach ($selectionData as &$values) {
            sort($values);
        }

        return $selectionData;
    }

    // Create a new record or update if it exists
    public function createCareAnswer($data)
    {
        // 1. Check if a record with the same pres_id and cover_id already exists
        $stmt = $this->pdo->prepare('SELECT id FROM care_answer WHERE pres_id = :pres_id AND cover_id = :cover_id');
        $stmt->execute([
            'pres_id' => $data['pres_id'],
            'cover_id' => $data['cover_id']
        ]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            // 2a. If it exists, update the existing record
            $this->updateCareAnswer($existingId, $data);
            return ['status' => 'updated', 'id' => $existingId];
        } else {
            // 2b. If it does not exist, create a new record

            // Get the total count of existing answers to generate a new answer_id
            $stmt = $this->pdo->query('SELECT COUNT(*) FROM care_answer');
            $count = $stmt->fetchColumn();
            $newAnswerId = 'ANS' . ($count + 1);
            $data['answer_id'] = $newAnswerId;

            // Insert the new record
            $columns = '`' . implode('`, `', array_keys($data)) . '`';
            $placeholders = ':' . implode(', :', array_keys($data));
            $sql = "INSERT INTO `care_answer` ($columns) VALUES ($placeholders)";
            $stmt = $this->pdo->prepare($sql);

            // Return the new answer_id on success
            if ($stmt->execute($data)) {
                return ['status' => 'created', 'answer_id' => $newAnswerId];
            }
        }

        return false;
    }

    // Update an existing record
    public function updateCareAnswer($id, $data)
    {
        // Prevent updating key identifiers
        unset($data['id']);
        unset($data['answer_id']);
        unset($data['pres_id']);
        unset($data['cover_id']);

        if (empty($data)) {
            return true; // Nothing to update
        }
        
        $setPart = [];
        foreach ($data as $key => $value) {
            $setPart[] = "`$key` = :$key";
        }
        $sql = "UPDATE care_answer SET " . implode(', ', $setPart) . " WHERE id = :id";
        
        $data['id'] = $id; // Add id back for the WHERE clause
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);
    }

    // Delete a record
    public function deleteCareAnswer($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_answer WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
