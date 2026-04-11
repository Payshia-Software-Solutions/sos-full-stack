<?php

class CommunityPostCategory
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM community_post_categories");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM community_post_categories WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
{
    // Add the current date and time for created_at
    $data['created_at'] = date('Y-m-d H:i:s'); // Format: YYYY-MM-DD HH:MM:SS

    $sql = "INSERT INTO community_post_categories (category_name, bg_color, is_active, created_by, created_at) 
            VALUES (:category_name, :bg_color, :is_active, :created_by, :created_at)";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($data);
}


    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        // Add the current date and time for created_at
        $data['created_at'] = date('Y-m-d H:i:s'); // Format: YYYY-MM-DD HH:MM:SS
        $sql = "UPDATE community_post_categories SET 
                    category_name = :category_name, 
                    bg_color = :bg_color, 
                    is_active = :is_active,
                    created_by = :created_by,
                    created_at = :created_at
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM community_post_categories WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    }