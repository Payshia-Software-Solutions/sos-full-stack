<?php

class CommunityKnowledgebase
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("
            SELECT 
                ck.id,
                ck.title,
                ck.user_account,
                ck.submitted_time,
                ck.type,
                ck.content,
                ck.current_status,
                ck.is_active,
                ck.views,
                ck.created_at,
                cpc.category_name,
                cpc.bg_color
            FROM community_knowledgebase ck
            JOIN community_post_categories cpc
            ON ck.category = cpc.id
        ");
    
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        // Calculate "days ago" for each record
        foreach ($records as &$record) {
            $record['days_ago'] = $this->calculateDaysAgo($record['created_at']);
        }
    
        return $records;
    }
    
    private function calculateDaysAgo($created_at)
    {
        // Convert the created_at timestamp to a DateTime object
        $createdDate = new DateTime($created_at);
        $now = new DateTime("now");
    
        // Calculate the difference in days
        $interval = $createdDate->diff($now);
        $days = $interval->days;
    
        // Return a formatted string
        if ($days == 0) {
            return "Today";
        } elseif ($days == 1) {
            return "1 Day ago";
        } else {
            return "$days Days ago";
        }
    }
    

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM community_knowledgebase WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO community_knowledgebase (title, user_account, submitted_time, type, category, content, current_status, is_active, views) 
                VALUES (:title, :user_account, :submitted_time, :type, :category, :content, :current_status, :is_active, :views)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE community_knowledgebase SET 
                    title = :title, 
                    user_account = :user_account,
                    submitted_time = :submitted_time,
                    type = :type,
                    category = :category,
                    content = :content,
                    current_status = :current_status,
                    is_active = :is_active,
                    views = :views
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM community_knowledgebase WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}