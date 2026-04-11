<?php
class StaffEarnings
{
    private $pdo;
    private $table = 'staff_earnings';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table}");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO {$this->table} 
            (studenty_number, description, type, Amount, created_by, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['studenty_number'],
            $data['description'],
            $data['type'],
            $data['Amount'],
            $data['created_by']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE {$this->table} SET 
                studenty_number = ?, description = ?, type = ?, Amount = ?, updated_by = ?, updated_at = NOW() 
                WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            $data['studenty_number'],
            $data['description'],
            $data['type'],
            $data['Amount'],
            $data['updated_by'],
            $id
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
