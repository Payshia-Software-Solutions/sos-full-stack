<?php
// models/User.php

class User
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllUsers()
    {
        $stmt = $this->pdo->query("SELECT * FROM users");
        return $stmt->fetchAll();
    }

    public function getUserById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getByUsername($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public function createUser($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO users (name, email) VALUES (?, ?)");
        return $stmt->execute([$data['name'], $data['email']]);
    }

    public function updateUser($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        return $stmt->execute([$data['name'], $data['email'], $id]);
    }

    public function updateUserByUsername($username, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        return $stmt->execute([$data['name'], $data['email'], $username]);
    }

    public function deleteUser($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getUserCount()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) AS user_count FROM users WHERE status = 'Active'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['user_count'];
    }



    // public function getRecordByUsernameOrName($value)
    // {
    //     $stmt = $this->pdo->prepare("
    //         SELECT * FROM users 
    //         WHERE (username LIKE :username OR fname LIKE :fname OR lname LIKE :lname) 
    //         AND status = 'Active'
    //     ");
    //     $stmt->execute([
    //         'username' => "%" . $value . "%",  // Adding wildcard for partial match
    //         'fname' => "%" . $value . "%",     // Adding wildcard for partial match
    //         'lname' => "%" . $value . "%"      // Adding wildcard for partial match
    //     ]);
    //     return $stmt->fetch(PDO::FETCH_ASSOC);
    // }
    public function getRecordByUsernameOrName($value)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM users 
            WHERE (username LIKE :username OR fname LIKE :fname OR lname LIKE :lname) 
            AND status = 'Active'
            LIMIT 5
        ");

        // Bind parameters separately for username, fname, lname
        $stmt->execute([
            'username' => "%" . $value . "%",
            'fname' => "%" . $value . "%",
            'lname' => "%" . $value . "%"
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);  // Return all matches (max 6)
    }

    public function getStaffUsers()
    {
        $stmt = $this->pdo->query("SELECT * FROM users WHERE userlevel != 'Student' AND status = 'Active'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
