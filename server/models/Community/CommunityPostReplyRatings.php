<?php

class CommunityPostReplyRatings
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
                reply_id, 
                created_by, 
                ratings 
            FROM community_post_reply_ratings
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($reply_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM community_post_reply_ratings WHERE reply_id = :reply_id");
        $stmt->execute(['reply_id' => $reply_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createOrUpdateRecord($data)
    {
        // Check if the combination of reply_id and created_by already exists
        $existingRecord = $this->checkIfUserHasRecord($data['reply_id'], $data['created_by']);
        
        if ($existingRecord) {
            // Update the existing record
            $this->updateRecord($existingRecord['id'], $data); // Assuming 'id' is the primary key
        } else {
            // Ensure created_at is provided by the client
            if (!isset($data['created_at'])) {
                throw new Exception("The 'created_at' timestamp is required.");
            }
            
            $sql = "INSERT INTO community_post_reply_ratings (reply_id, created_by, ratings, created_at) 
                    VALUES (:reply_id, :created_by, :ratings, :created_at)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($data);
        }
    }

    public function updateRecord($id, $data)
{
    $sql = "UPDATE community_post_reply_ratings SET 
                ratings = :ratings,
                created_at = :created_at
            WHERE id = :id"; // Use the primary key to identify the record

    // Ensure required fields are provided
    if (!isset($data['ratings']) || !isset($data['created_at'])) {
        throw new Exception("Both 'ratings' and 'created_at' are required.");
    }

    // Prepare the statement
    $stmt = $this->pdo->prepare($sql);

    // Bind the parameters explicitly
    $stmt->bindParam(':ratings', $data['ratings']);
    $stmt->bindParam(':created_at', $data['created_at']);
    $stmt->bindParam(':id', $id);

    // Execute the statement
    $stmt->execute();
}


    public function deleteRecord($reply_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM community_post_reply_ratings WHERE reply_id = :reply_id");
        $stmt->execute(['reply_id' => $reply_id]);
    }

    public function checkIfUserHasRecord($reply_id, $created_by)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM community_post_reply_ratings WHERE reply_id = :reply_id AND created_by = :created_by");
        $stmt->execute([
            'reply_id' => $reply_id,
            'created_by' => $created_by
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}