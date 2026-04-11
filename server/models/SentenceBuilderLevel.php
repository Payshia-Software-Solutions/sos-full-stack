<?php

class SentenceBuilderLevel
{
    private $pdo;
    private $table = 'sentence_builder_levels';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (level_number, pattern) VALUES (:level_number, :pattern)");
        $stmt->execute([
            'level_number' => $data['level_number'],
            'pattern' => $data['pattern'],
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET level_number = :level_number, pattern = :pattern WHERE id = :id");
        $stmt->execute([
            'id' => $id,
            'level_number' => $data['level_number'],
            'pattern' => $data['pattern'],
        ]);
        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount();
    }
}