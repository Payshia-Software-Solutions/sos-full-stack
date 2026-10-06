<?php
// models/Announcement.php

class Announcement
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureTableExists();
    }

    private function ensureTableExists()
    {
        try {
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS `announcements` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `content` TEXT NOT NULL,
                `author` VARCHAR(255) NULL,
                `category` VARCHAR(100) DEFAULT 'General',
                `is_new` TINYINT(1) DEFAULT 1,
                `imageUrl` VARCHAR(500) NULL,
                `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        } catch (\PDOException $e) {
            // Ignore if already created or permission issue
        }
    }

    public function getAll()
    {
        try {
            $stmt = $this->pdo->query("SELECT id, title, content, author, category, is_new, imageUrl, createdAt FROM announcements ORDER BY createdAt DESC");
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Ensure id is formatted as string to match frontend types if needed
            return array_map(function ($item) {
                $item['id'] = (string)$item['id'];
                $item['is_new'] = (bool)$item['is_new'];
                return $item;
            }, $results);
        } catch (\PDOException $e) {
            return [];
        }
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, title, content, author, category, is_new, imageUrl, createdAt FROM announcements WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($item) {
            $item['id'] = (string)$item['id'];
            $item['is_new'] = (bool)$item['is_new'];
        }
        return $item;
    }

    public function create($data)
    {
        $sql = "INSERT INTO announcements (title, content, author, category, is_new, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $author = $data['author'] ?? 'Admin';
        $category = $data['category'] ?? 'General';
        $is_new = isset($data['is_new']) ? ($data['is_new'] ? 1 : 0) : 1;
        $imageUrl = !empty($data['imageUrl']) ? $data['imageUrl'] : null;
        $createdAt = !empty($data['createdAt']) ? $data['createdAt'] : date('Y-m-d H:i:s');

        $stmt->execute([$title, $content, $author, $category, $is_new, $imageUrl, $createdAt]);
        $newId = $this->pdo->lastInsertId();

        return $this->getById($newId);
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [];

        if (array_key_exists('title', $data)) {
            $fields[] = "title = ?";
            $params[] = $data['title'];
        }
        if (array_key_exists('content', $data)) {
            $fields[] = "content = ?";
            $params[] = $data['content'];
        }
        if (array_key_exists('author', $data)) {
            $fields[] = "author = ?";
            $params[] = $data['author'];
        }
        if (array_key_exists('category', $data)) {
            $fields[] = "category = ?";
            $params[] = $data['category'];
        }
        if (array_key_exists('is_new', $data)) {
            $fields[] = "is_new = ?";
            $params[] = $data['is_new'] ? 1 : 0;
        }
        if (array_key_exists('imageUrl', $data)) {
            $fields[] = "imageUrl = ?";
            $params[] = !empty($data['imageUrl']) ? $data['imageUrl'] : null;
        }

        if (!empty($fields)) {
            $params[] = $id;
            $sql = "UPDATE announcements SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
        }

        return $this->getById($id);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM announcements WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
