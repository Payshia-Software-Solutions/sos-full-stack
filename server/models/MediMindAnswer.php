<?php

class MediMindAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from medi_mind_answers
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT 
                a.id, 
                a.medicine_id, 
                a.question_id, 
                a.answer_id, 
                a.created_at, 
                a.created_by,
                m.medicine_name,
                q.question,
                qa.answer
            FROM 
                medi_mind_answers a
            LEFT JOIN 
                medi_mind_medicines m ON a.medicine_id = m.id
            LEFT JOIN 
                medi_mind_quetions q ON a.question_id = q.id
            LEFT JOIN 
                medi_mind_quest_answers qa ON a.answer_id = qa.id
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                a.id, 
                a.medicine_id, 
                a.question_id, 
                a.answer_id, 
                a.created_at, 
                a.created_by,
                m.medicine_name,
                q.question,
                qa.answer
            FROM 
                medi_mind_answers a
            LEFT JOIN 
                medi_mind_medicines m ON a.medicine_id = m.id
            LEFT JOIN 
                medi_mind_quetions q ON a.question_id = q.id
            LEFT JOIN 
                medi_mind_quest_answers qa ON a.answer_id = qa.id
            WHERE 
                a.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get records by medicine ID with all possible answers
    public function getByMedicineId($medicineId)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                a.id, 
                a.medicine_id, 
                a.question_id, 
                a.answer_id, 
                a.created_at, 
                a.created_by,
                q.question,
                qa.answer as correct_answer
            FROM 
                medi_mind_answers a
            LEFT JOIN 
                medi_mind_quetions q ON a.question_id = q.id
            LEFT JOIN 
                medi_mind_quest_answers qa ON a.answer_id = qa.id
            WHERE 
                a.medicine_id = ?
        ");
        $stmt->execute([$medicineId]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($questions as &$question) {
            $stmtOptions = $this->pdo->prepare("
                SELECT id, answer 
                FROM medi_mind_quest_answers 
                WHERE question_id = ?
            ");
            $stmtOptions->execute([$question['question_id']]);
            $question['options'] = $stmtOptions->fetchAll(PDO::FETCH_ASSOC);
        }

        return $questions;
    }

    // Create a new record
    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `medi_mind_answers` 
                (medicine_id, question_id, answer_id, created_by, created_at) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['medicine_id'],
            $data['question_id'],
            $data['answer_id'],
            $data['created_by'],
            date('Y-m-d H:i:s')
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update a record
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE `medi_mind_answers` 
            SET medicine_id = ?, question_id = ?, answer_id = ? 
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['medicine_id'], 
            $data['question_id'], 
            $data['answer_id'], 
            $id
        ]);
    }

    // Delete a record
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `medi_mind_answers` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
