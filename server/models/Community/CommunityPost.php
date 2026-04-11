<?php

class CommunityPost
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM community_post");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM community_post WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        // Set submitted_time to the current date and time
        $data['submitted_time'] = date('Y-m-d H:i:s'); // Format: YYYY-MM-DD HH:MM:SS
        
        $sql = "INSERT INTO community_post (title, user_account, submitted_time, type, category, content, current_status, is_active, views) 
                VALUES (:title, :user_account, :submitted_time, :type, :category, :content, :current_status, :is_active, :views)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE community_post SET 
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
        $stmt = $this->pdo->prepare("DELETE FROM community_post WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Get the total number of posts in each category
    public function getCategoryPostCount()
{
    $sql = "SELECT cpc.category_name, cpc.bg_color, COUNT(cp.id) AS post_count 
            FROM community_post_categories cpc
            LEFT JOIN community_post cp ON cpc.id = cp.category
            GROUP BY cpc.category_name, cpc.bg_color";
    
    $stmt = $this->pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
    // $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Restructure the result to match the format { "category_name": {"post_count": 5, "bg_color": "#color"} }
    // $categoryPostCounts = [];
    // foreach ($results as $row) {
    //     $categoryPostCounts[$row['category_name']] = [
    //         'post_count' => (int) $row['post_count'],
    //         'bg_color' => $row['bg_color']
    //     ];
    // }

    // return $categoryPostCounts;
}

}