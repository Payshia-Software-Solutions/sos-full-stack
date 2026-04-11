<?php

class User
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = :id AND status = 'Active'");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }

        $sql = "INSERT INTO users 
                (status_id, userid, fname, lname, batch_id, username, phone, email, password, userlevel, status, created_by, created_at, batch_lock) 
                VALUES 
                (:status_id, :userid, :fname, :lname, :batch_id, :username, :phone, :email, :password, :userlevel, :status, :created_by, :created_at, :batch_lock)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        if (!isset($data['updated_at'])) {
            $data['updated_at'] = date('Y-m-d H:i:s');
        }

        $data['id'] = $id;

        $sql = "UPDATE users SET 
                    status_id = :status_id, 
                    userid = :userid, 
                    fname = :fname, 
                    lname = :lname, 
                    batch_id = :batch_id, 
                    username = :username, 
                    phone = :phone, 
                    email = :email, 
                    password = :password, 
                    userlevel = :userlevel, 
                    status = :status, 
                    batch_lock = :batch_lock, 
                    updated_at = :updated_at
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("UPDATE users SET status = 'Inactive' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function getUserCount()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) AS user_count FROM users WHERE status = 'Active'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['user_count'];
    }


    public function getRecordByUsernameOrName($value)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM users 
            WHERE (username = :value OR fname = :value OR lname = :value) 
            AND status = 'Active'
        ");
        $stmt->execute(['value' => $value]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getRecordByUsername($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->execute(['username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStaffUsers()
    {
        $stmt = $this->pdo->query("SELECT * FROM users WHERE userlevel != 'Student' AND status = 'Active'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
