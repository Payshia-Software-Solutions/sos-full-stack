<?php

use Carbon\Carbon;

class CommunityPostReply
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM community_post_reply");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM community_post_reply WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        // Set the current timestamp if 'created_at' is not provided in $data
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }

        $sql = "INSERT INTO community_post_reply (post_id, reply_content, created_by, created_at, likes, dislikes, is_active) 
                VALUES (:post_id, :reply_content, :created_by, :created_at, :likes, :dislikes, :is_active)";
        
        $stmt = $this->pdo->prepare($sql);
        
        // Bind the data to the query
        $stmt->execute([
            ':post_id' => $data['post_id'],
            ':reply_content' => $data['reply_content'],
            ':created_by' => $data['created_by'],
            ':created_at' => $data['created_at'],
            ':likes' => $data['likes'],
            ':dislikes' => $data['dislikes'],
            ':is_active' => $data['is_active']
        ]);
    }

    public function updateRecord($id, $data)
    {
        if (!isset($data['created_at'])) {
            $currentRecord = $this->getRecordById($id);
            $data['created_at'] = $currentRecord['created_at'];
        }

        $data['id'] = $id;

        $sql = "UPDATE community_post_reply SET 
                    post_id = :post_id, 
                    reply_content = :reply_content, 
                    created_by = :created_by,
                    created_at = :created_at, 
                    likes = :likes,
                    dislikes = :dislikes,
                    is_active = :is_active
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':post_id' => $data['post_id'],
            ':reply_content' => $data['reply_content'],
            ':created_by' => $data['created_by'],
            ':created_at' => $data['created_at'],
            ':likes' => $data['likes'],
            ':dislikes' => $data['dislikes'],
            ':is_active' => $data['is_active'],
            ':id' => $data['id']
        ]);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM community_post_reply WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function getReplyStatistics()
{
    $sql = "
        SELECT 
            r.created_by AS student_name, 
            COUNT(r.id) AS reply_count, 
            COUNT(DISTINCT r.post_id) AS reply_post_count,
            COALESCE(SUM(rr.ratings), 0) AS total_ratings
        FROM 
            community_post_reply AS r
        LEFT JOIN 
            community_post_reply_ratings AS rr ON r.id = rr.reply_id
        GROUP BY 
            r.created_by
        ORDER BY 
            reply_post_count DESC"; 

    $stmt = $this->pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}



    public function getRecordsByPostId($postId, $loggedUser)
    {
        $sql = "
            SELECT 
                r.*,
                COALESCE(ra.ratings, 0) AS user_rating,
                (SELECT COUNT(*) FROM community_post_reply_ratings ra_count 
                 WHERE ra_count.reply_id = r.id) AS rating_count
            FROM 
                community_post_reply r
            LEFT JOIN 
                community_post_reply_ratings ra 
                ON r.id = ra.reply_id 
                AND ra.created_by = :loggedUser
            WHERE 
                r.post_id = :post_id
        ";
    
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'post_id' => $postId,
            'loggedUser' => $loggedUser
        ]);
    
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        // Add relative time (e.g., "x days ago") to each record
        foreach ($records as &$record) {
            $submittedTime = Carbon::parse($record['created_at']);
            $record['time_ago'] = $submittedTime->diffForHumans();
        }
    
        return $records;
    }
    
    

}