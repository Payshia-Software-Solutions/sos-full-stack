<?php

class BirthdayWishLog
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function createLog($data)
    {
        $sql = "INSERT INTO birthday_wish_logs (student_id, student_name, type, recipient, status, error_message, message_content) 
                VALUES (:student_id, :student_name, :type, :recipient, :status, :error_message, :message_content)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);
    }

    public function getRecentLogs($limit = 50)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM birthday_wish_logs ORDER BY sent_at DESC LIMIT :limit");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
