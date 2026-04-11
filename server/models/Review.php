<?php
// --- models/Review.php ---
class Review
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM reviews");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM reviews WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO reviews (user_id, item_type, item_id, rating, title, comment, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['user_id'],
            $data['item_type'],
            $data['item_id'],
            $data['rating'],
            $data['title'] ?? null,
            $data['comment'] ?? null,
            $data['status'] ?? 'pending'
        ]);
        return $this->getById($this->pdo->lastInsertId());
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE reviews 
            SET user_id = ?, item_type = ?, item_id = ?, rating = ?, title = ?, comment = ?, status = ? 
            WHERE id = ?
        ");
        $stmt->execute([
            $data['user_id'],
            $data['item_type'],
            $data['item_id'],
            $data['rating'],
            $data['title'] ?? null,
            $data['comment'] ?? null,
            $data['status'] ?? 'pending',
            $id
        ]);
        return $this->getById($id);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM reviews WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
