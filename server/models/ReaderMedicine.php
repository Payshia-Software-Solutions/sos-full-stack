<?php

class ReaderMedicine
{
    private $pdo;
    private $table = 'reader_medicine';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActive()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table} WHERE active_status = 'Active'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUnanswered($userId)
    {
        // Get all active prescription IDs that have not been correctly answered by this user
        $sql = "SELECT m.* FROM {$this->table} m 
                WHERE m.active_status = 'Active' 
                AND m.id NOT IN (
                    SELECT a.pres_id 
                    FROM reader_attempts a 
                    WHERE a.user_id = :user_id AND a.answer_status = 'Correct'
                )";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO {$this->table} (
                pres_name, difficulty, image_path, active_status, PresHelp, 
                prescription_question, answer_1, answer_2, answer_3, answer_4, 
                correct_answer, created_by
            ) VALUES (
                :pres_name, :difficulty, :image_path, :active_status, :PresHelp, 
                :prescription_question, :answer_1, :answer_2, :answer_3, :answer_4, 
                :correct_answer, :created_by
            )
        ");
        
        $stmt->execute([
            'pres_name' => $data['pres_name'],
            'difficulty' => $data['difficulty'],
            'image_path' => $data['image_path'],
            'active_status' => $data['active_status'] ?? 'Active',
            'PresHelp' => $data['PresHelp'],
            'prescription_question' => $data['prescription_question'],
            'answer_1' => $data['answer_1'],
            'answer_2' => $data['answer_2'],
            'answer_3' => $data['answer_3'],
            'answer_4' => $data['answer_4'],
            'correct_answer' => $data['correct_answer'],
            'created_by' => $data['created_by'] ?? 'Admin'
        ]);
        
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE {$this->table} SET 
                pres_name = :pres_name, 
                difficulty = :difficulty, 
                image_path = :image_path, 
                active_status = :active_status, 
                PresHelp = :PresHelp, 
                prescription_question = :prescription_question, 
                answer_1 = :answer_1, 
                answer_2 = :answer_2, 
                answer_3 = :answer_3, 
                answer_4 = :answer_4, 
                correct_answer = :correct_answer
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'pres_name' => $data['pres_name'],
            'difficulty' => $data['difficulty'],
            'image_path' => $data['image_path'],
            'active_status' => $data['active_status'],
            'PresHelp' => $data['PresHelp'],
            'prescription_question' => $data['prescription_question'],
            'answer_1' => $data['answer_1'],
            'answer_2' => $data['answer_2'],
            'answer_3' => $data['answer_3'],
            'answer_4' => $data['answer_4'],
            'correct_answer' => $data['correct_answer']
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
