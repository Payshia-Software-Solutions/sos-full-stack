<?php

class UserFullDetails
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllUsers()
    {
        $stmt = $this->pdo->query("SELECT * FROM user_full_details ORDER BY `id` DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM user_full_details WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserByUserName($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM user_full_details WHERE username = :username");
        $stmt->execute(['username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateCertificateNameByUserName($username, $name_on_certificate)
    {
        $stmt = $this->pdo->prepare("UPDATE user_full_details SET name_on_certificate = :name_on_certificate WHERE username = :username");
        $stmt->execute(['name_on_certificate' => $name_on_certificate, 'username' => $username]);
    }

    public function createUser($data)
    {
        $sql = "INSERT INTO user_full_details (student_id, username, civil_status, first_name, last_name, gender, address_line_1, address_line_2, city, district, postal_code, telephone_1, telephone_2, nic, e_mail, birth_day, updated_by, updated_at, full_name, name_with_initials, name_on_certificate) 
                VALUES (:student_id, :username, :civil_status, :first_name, :last_name, :gender, :address_line_1, :address_line_2, :city, :district, :postal_code, :telephone_1, :telephone_2, :nic, :e_mail, :birth_day, :updated_by, :updated_at, :full_name, :name_with_initials, :name_on_certificate)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateUser($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE user_full_details SET 
                    student_id = :student_id, 
                    username = :username, 
                    civil_status = :civil_status, 
                    first_name = :first_name, 
                    last_name = :last_name, 
                    gender = :gender, 
                    address_line_1 = :address_line_1, 
                    address_line_2 = :address_line_2, 
                    city = :city, 
                    district = :district, 
                    postal_code = :postal_code, 
                    telephone_1 = :telephone_1, 
                    telephone_2 = :telephone_2, 
                    nic = :nic, 
                    e_mail = :e_mail, 
                    birth_day = :birth_day, 
                    updated_by = :updated_by, 
                    updated_at = :updated_at, 
                    full_name = :full_name, 
                    name_with_initials = :name_with_initials, 
                    name_on_certificate = :name_on_certificate
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteUser($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM user_full_details WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
