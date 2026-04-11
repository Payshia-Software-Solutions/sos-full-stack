<?php

class MediMindStudentAnswer
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records from medi_mind_student_answers
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT 
                sa.id, 
                sa.medicine_id, 
                sa.question_id, 
                sa.answer_id, 
                sa.correct_status, 
                sa.created_by, 
                sa.created_at,
                m.medicine_name,
                q.question,
                qa.answer
            FROM 
                medi_mind_student_answers sa
            LEFT JOIN 
                medi_mind_medicines m ON sa.medicine_id = m.id
            LEFT JOIN 
                medi_mind_quetions q ON sa.question_id = q.id
            LEFT JOIN 
                medi_mind_quest_answers qa ON sa.answer_id = qa.id
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                sa.id, 
                sa.medicine_id, 
                sa.question_id, 
                sa.answer_id, 
                sa.correct_status, 
                sa.created_by, 
                sa.created_at,
                m.medicine_name,
                q.question,
                qa.answer
            FROM 
                medi_mind_student_answers sa
            LEFT JOIN 
                medi_mind_medicines m ON sa.medicine_id = m.id
            LEFT JOIN 
                medi_mind_quetions q ON sa.question_id = q.id
            LEFT JOIN 
                medi_mind_quest_answers qa ON sa.answer_id = qa.id
            WHERE 
                sa.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get submissions by student ID (created_by)
    public function getByStudent($studentId)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                sa.id, 
                sa.medicine_id, 
                sa.question_id, 
                sa.answer_id, 
                sa.correct_status, 
                sa.created_at,
                m.medicine_name,
                q.question,
                qa.answer
            FROM 
                medi_mind_student_answers sa
            LEFT JOIN 
                medi_mind_medicines m ON sa.medicine_id = m.id
            LEFT JOIN 
                medi_mind_quetions q ON sa.question_id = q.id
            LEFT JOIN 
                medi_mind_quest_answers qa ON sa.answer_id = qa.id
            WHERE 
                sa.created_by = ?
            ORDER BY 
                sa.created_at DESC
        ");
        $stmt->execute([$studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get correct and wrong counts for a student
    public function getStatsByStudent($studentId)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                SUM(CASE WHEN correct_status = 'Correct' THEN 1 ELSE 0 END) AS correct_count,
                SUM(CASE WHEN correct_status = 'Wrong' THEN 1 ELSE 0 END) AS wrong_count,
                COUNT(*) AS total_count
            FROM 
                medi_mind_student_answers
            WHERE 
                created_by = ?
        ");
        $stmt->execute([$studentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new student answer record
    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `medi_mind_student_answers` 
                (medicine_id, question_id, answer_id, correct_status, created_by, created_at) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['medicine_id'],
            $data['question_id'],
            $data['answer_id'],
            $data['correct_status'],
            $data['created_by'],
            date('Y-m-d H:i:s')
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update a record
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE `medi_mind_student_answers` 
            SET medicine_id = ?, question_id = ?, answer_id = ?, correct_status = ? 
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['medicine_id'], 
            $data['question_id'], 
            $data['answer_id'], 
            $data['correct_status'],
            $id
        ]);
    }

    // Delete a record
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `medi_mind_student_answers` WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
