<?php

class Testimonials
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all testimonials
    public function getAllTestimonials()
    {
        $stmt = $this->pdo->query("SELECT id, name, role, image_url, comment, rating, created_at FROM testimonials");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single testimonial by ID
    public function getTestimonialById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, name, role, image_url, comment, rating, created_at FROM testimonials WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new testimonial
    public function createTestimonial($data)
    {
        $sql = "INSERT INTO testimonials (name, role, image_url, comment, rating) 
                VALUES (:name, :role, :image_url, :comment, :rating)";
        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            'name' => $data['name'],
            'role' => $data['role'],
            'image_url' => $data['image_url'],
            'comment' => $data['comment'],
            'rating' => $data['rating'],
        ]);
    }

    // Update an existing testimonial by ID
    public function updateTestimonial($id, $data)
    {
        $sql = "UPDATE testimonials SET 
                    name = :name, 
                    role = :role, 
                    image_url = :image_url, 
                    comment = :comment, 
                    rating = :rating 
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'role' => $data['role'],
            'image_url' => $data['image_url'],
            'comment' => $data['comment'],
            'rating' => $data['rating'],
        ]);
    }

    // Delete a testimonial by ID
    public function deleteTestimonial($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM testimonials WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
