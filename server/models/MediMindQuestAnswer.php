<?php

class MediMindQuestAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from medi_mind_quest_answers
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT a.id, a.question_id, a.answer, a.created_by, a.created_at, q.question FROM medi_mind_quest_answers a JOIN medi_mind_quetions q ON a.question_id = q.id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT a.id, a.question_id, a.answer, a.created_by, a.created_at, q.question FROM medi_mind_quest_answers a JOIN medi_mind_quetions q ON a.question_id = q.id WHERE a.id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Get all answers for a specific question ID
    public function getByQuestionId($questionId)
    {
        $stmt = $this->pdo->prepare("
            SELECT
                a.id,
                a.answer,
                a.created_by,
                a.created_at,
                q.question
            FROM
                medi_mind_quest_answers AS a
            JOIN
                medi_mind_quetions AS q ON a.question_id = q.id
            WHERE
                a.question_id = ?
        ");
        $stmt->execute([$questionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Create a new record
    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `medi_mind_quest_answers` (question_id, answer, created_by, created_at) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['question_id'],
            $data['answer'],
            $data['created_by'],
            date('Y-m-d H:i:s')
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update a record
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `medi_mind_quest_answers` SET question_id = ?, answer = ? WHERE id = ?");
        return $stmt->execute([$data['question_id'], $data['answer'], $id]);
    }

    // Delete a record
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `medi_mind_quest_answers` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
