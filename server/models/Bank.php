<?php
class Bank
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllBanks()
    {
        $stmt = $this->pdo->query("SELECT id, bank_code, bank_name FROM banks");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBankById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, bank_code, bank_name FROM banks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createBank($bank_code, $bank_name)
    {
        $stmt = $this->pdo->prepare("INSERT INTO banks (bank_code, bank_name) VALUES (?, ?)");
        return $stmt->execute([$bank_code, $bank_name]);
    }

    public function updateBank($id, $bank_code, $bank_name)
    {
        $stmt = $this->pdo->prepare("UPDATE banks SET bank_code = ?, bank_name = ? WHERE id = ?");
        return $stmt->execute([$bank_code, $bank_name, $id]);
    }

    public function deleteBank($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM banks WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
