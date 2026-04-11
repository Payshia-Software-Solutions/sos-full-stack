<?php

class TempLmsUser
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Count all users
    public function countUsers()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) AS user_count FROM temp_lms_user");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['user_count'];
    }

    // Get all users
    public function getAllUsers()
    {
        $stmt = $this->pdo->query("SELECT * FROM temp_lms_user");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a user by ID
    public function getUserById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM temp_lms_user WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    

    // Create a new user
    public function createUser($data)
    {
        $sql = "INSERT INTO temp_lms_user (
                    email_address, civil_status, first_name, last_name, password, nic_number, phone_number, 
                    whatsapp_number, address_l1, address_l2, city, district, postal_code, paid_amount, 
                    aprroved_status, created_at, full_name, name_with_initials, gender, index_number, 
                    name_on_certificate, selected_course
                ) VALUES (
                    :email_address, :civil_status, :first_name, :last_name, :password, :nic_number, :phone_number, 
                    :whatsapp_number, :address_l1, :address_l2, :city, :district, :postal_code, :paid_amount, 
                    :aprroved_status, :created_at, :full_name, :name_with_initials, :gender, :index_number, 
                    :name_on_certificate, :selected_course
                )";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);

        // Return the auto-generated ID
        return $this->pdo->lastInsertId();
    }




    // Update a user by ID
    public function updateUser($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE temp_lms_user SET 
                    email_address = :email_address,
                    civil_status = :civil_status,
                    first_name = :first_name,
                    last_name = :last_name,
                    password = :password,
                    nic_number = :nic_number,
                    phone_number = :phone_number,
                    whatsapp_number = :whatsapp_number,
                    address_l1 = :address_l1,
                    address_l2 = :address_l2,
                    city = :city,
                    district = :district,
                    postal_code = :postal_code,
                    paid_amount = :paid_amount,
                    aprroved_status = :aprroved_status,
                    created_at = :created_at,
                    full_name = :full_name,
                    name_with_initials = :name_with_initials,
                    gender = :gender,
                    index_number = :index_number,
                    name_on_certificate = :name_on_certificate,
                    selected_course = :selected_course
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a user by ID
    public function deleteUser($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM temp_lms_user WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Get users by approval status
    public function getUsersByApprovalStatus($status)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM temp_lms_user WHERE aprroved_status = :status");
        $stmt->execute(['status' => $status]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get users by selected course
    public function getUsersByCourse($course)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM temp_lms_user WHERE selected_course = :course");
        $stmt->execute(['course' => $course]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
