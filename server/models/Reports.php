<?php

class Reports
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserInfo($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM user_full_details WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
