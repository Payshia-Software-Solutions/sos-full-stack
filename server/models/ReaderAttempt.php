<?php

class ReaderAttempt
{
    private $pdo;
    private $table = 'reader_attempts';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByUserId($userId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCorrectByUserId($userId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = :user_id AND answer_status = 'Correct'");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO {$this->table} (
                pres_id, user_id, difficulty, selected_answer, score, answer_status
            ) VALUES (
                :pres_id, :user_id, :difficulty, :selected_answer, :score, :answer_status
            )
        ");
        
        $stmt->execute([
            'pres_id' => $data['pres_id'],
            'user_id' => $data['user_id'],
            'difficulty' => $data['difficulty'],
            'selected_answer' => $data['selected_answer'],
            'score' => $data['score'] ?? 0,
            'answer_status' => $data['answer_status']
        ]);
        
        return $this->pdo->lastInsertId();
    }

    public function getOverallGrade($userId)
    {
        // Fetch all attempts for a user
        $stmt = $this->pdo->prepare("SELECT score FROM {$this->table} WHERE user_id = :user_id AND answer_status = 'Correct'");
        $stmt->execute(['user_id' => $userId]);
        $scores = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($scores)) {
            return 0;
        }
        
        $totalScore = array_sum($scores);
        return $totalScore;
    }
}
