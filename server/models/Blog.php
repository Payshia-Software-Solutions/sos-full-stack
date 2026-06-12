<?php
// models/Blog.php

class Blog
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllBlogs()
    {
        $stmt = $this->pdo->query("SELECT blogID as id, BlogTitle as title, slug, BlogContent as content, BlogAuthor as author, blogImagePath as image_url, BlogStatus as status, Category as category, CreatedAt as created_at FROM blogs ORDER BY CreatedAt DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBlogById($id)
    {
        $stmt = $this->pdo->prepare("SELECT blogID as id, BlogTitle as title, slug, BlogContent as content, BlogAuthor as author, blogImagePath as image_url, BlogStatus as status, Category as category, CreatedAt as created_at FROM blogs WHERE blogID = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getBlogBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT blogID as id, BlogTitle as title, slug, BlogContent as content, BlogAuthor as author, blogImagePath as image_url, BlogStatus as status, Category as category, CreatedAt as created_at FROM blogs WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createBlog($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO blogs (BlogTitle, slug, BlogContent, BlogAuthor, blogImagePath, BlogStatus, BlogDate, Category) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)");
        return $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['content'],
            $data['author'] ?? null,
            $data['image_url'] ?? null,
            $data['status'] ?? 'published',
            $data['category'] ?? ''
        ]);
    }

    public function updateBlog($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE blogs SET BlogTitle = ?, slug = ?, BlogContent = ?, BlogAuthor = ?, blogImagePath = ?, BlogStatus = ?, Category = ? WHERE blogID = ?");
        return $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['content'],
            $data['author'] ?? null,
            $data['image_url'] ?? null,
            $data['status'] ?? 'published',
            $data['category'] ?? '',
            $id
        ]);
    }

    public function deleteBlog($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM blogs WHERE blogID = ?");
        return $stmt->execute([$id]);
    }
}
