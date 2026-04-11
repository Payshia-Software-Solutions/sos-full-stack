<?php
class CommisionSetup
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM commision_setup");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM commision_setup WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $sql = "INSERT INTO commision_setup (task_reference, per_rate, created_by, created_at, updated_by, last_update)
                VALUES (?, ?, ?, NOW(), ?, NOW())";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['task_reference'],
            $data['per_rate'],
            $data['created_by'] ?? null,
            $data['updated_by'] ?? null
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, array $data)
    {
        $sql = "UPDATE commision_setup
                SET task_reference = ?, per_rate = ?, updated_by = ?, last_update = NOW()
                WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            $data['task_reference'],
            $data['per_rate'],
            $data['updated_by'] ?? null,
            $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM commision_setup WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
