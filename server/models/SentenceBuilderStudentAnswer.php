<?php

class SentenceBuilderStudentAnswer
{
    private $pdo;
    private $table = 'sentence_builder_student_answers';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByStudentNumber($student_number)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE student_number = :student_number");
        $stmt->execute(['student_number' => $student_number]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (student_number, sentence_id, submitted_answer, is_correct, score_awarded) VALUES (:student_number, :sentence_id, :submitted_answer, :is_correct, :score_awarded)");
        $stmt->execute([
            'student_number' => $data['student_number'],
            'sentence_id' => $data['sentence_id'],
            'submitted_answer' => $data['submitted_answer'],
            'is_correct' => $data['is_correct'],
            'score_awarded' => $data['score_awarded'] ?? 0,
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET student_number = :student_number, sentence_id = :sentence_id, submitted_answer = :submitted_answer, is_correct = :is_correct, score_awarded = :score_awarded WHERE id = :id");
        $stmt->execute([
            'id' => $id,
            'student_number' => $data['student_number'],
            'sentence_id' => $data['sentence_id'],
            'submitted_answer' => $data['submitted_answer'],
            'is_correct' => $data['is_correct'],
            'score_awarded' => $data['score_awarded'] ?? 0,
        ]);
        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }
}
