<?php

class SentenceBuilderSentence
{
    private $pdo;
    private $table = 'sentence_builder_sentences';

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

    public function getByLevelId($level_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE level_id = :level_id");
        $stmt->execute(['level_id' => $level_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (level_id, correct_sentence, hint, translation) VALUES (:level_id, :correct_sentence, :hint, :translation)");
        $stmt->execute([
            'level_id' => $data['level_id'],
            'correct_sentence' => $data['correct_sentence'],
            'hint' => $data['hint'] ?? null,
            'translation' => $data['translation'] ?? null,
        ]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET level_id = :level_id, correct_sentence = :correct_sentence, hint = :hint, translation = :translation WHERE id = :id");
        $stmt->execute([
            'id' => $id,
            'level_id' => $data['level_id'],
            'correct_sentence' => $data['correct_sentence'],
            'hint' => $data['hint'] ?? null,
            'translation' => $data['translation'] ?? null,
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