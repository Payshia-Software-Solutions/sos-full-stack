<?php
// models/CertificationCenter/CcCertificateOrder.php

class CcCertificateOrder
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllOrders()
    {
        // SQL query to join `cc_certificate_order` with `cc_certificate_list` and get certificate_name
        $sql = "SELECT 
                o.*, 
                c.list_name AS certificate_name 
            FROM 
                `cc_certificate_order` o
            JOIN 
                `cc_certificate_list` c 
            ON 
                o.certificate_id = c.id";

        // Prepare the SQL statement
        $stmt = $this->pdo->prepare($sql);

        // Execute the statement
        $stmt->execute();

        // Fetch all results as an associative array
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllOrdersByUsername($username)
    {
        // SQL query to join `cc_certificate_order` with `cc_certificate_list` and get certificate_name
        $sql = "SELECT 
                  o.*, 
                  c.list_name AS certificate_name 
              FROM 
                  `cc_certificate_order` o
              JOIN 
                  `cc_certificate_list` c 
              ON 
                  o.certificate_id = c.id
              WHERE 
                  o.created_by LIKE :username";

        // Prepare the SQL statement
        $stmt = $this->pdo->prepare($sql);

        // Bind the username parameter with wildcards for the LIKE condition
        $stmt->bindValue(':username', '%' . $username . '%', PDO::PARAM_STR);

        // Execute the statement
        $stmt->execute();

        // Fetch all results as an associative array
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }




    public function getOrderById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `cc_certificate_order` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getUserAddress($userId)
    {
        $stmt = $this->pdo->prepare("SELECT `address_line_1`, `address_line_2` FROM `user_full_details` WHERE `id` = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function createOrder($data)
    {
        // Prepare and execute the insert statement
        $stmt = $this->pdo->prepare("INSERT INTO `cc_certificate_order` (`created_by`, `created_at`, `updated_at`, `course_code`, `mobile`, `address_line1`, `address_line2`, `city_id`, `type`, `payment`, `package_id`, `certificate_id`, `certificate_status`, `cod_amount`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['created_by'],
            $data['created_at'],
            $data['updated_at'],
            $data['course_code'],
            $data['mobile'],
            $data['address_line1'],
            $data['address_line2'],
            $data['city_id'],
            $data['type'],
            $data['payment'],
            $data['package_id'],
            $data['certificate_id'],
            $data['certificate_status'],
            $data['cod_amount'],
            $data['is_active']
        ]);
    }


    public function updateOrder($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `cc_certificate_order` SET `created_by` = ?, `created_at` = ?, `updated_at` = ?, `course_code` = ?, `mobile` = ?, `address_line1` = ?, `address_line2` = ?, `city_id` = ?, `type` = ?, `payment` = ?, `package_id` = ?, `certificate_id` = ?, `certificate_status` = ?, `cod_amount` = ?, `is_active` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['created_by'],
            $data['created_at'],
            $data['updated_at'],
            $data['course_code'],
            $data['mobile'],
            $data['address_line1'],
            $data['address_line2'],
            $data['city_id'],
            $data['type'],
            $data['payment'],
            $data['package_id'],
            $data['certificate_id'],
            $data['certificate_status'],
            $data['cod_amount'],
            $data['is_active'],
            $id
        ]);
    }

    public function deleteOrder($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `cc_certificate_order` WHERE `id` = ?");
        $stmt->execute([$id]);
    }

    // New method to update only the certificate_status
    public function updateCertificateStatus($id, $certificateStatus)
    {
        $stmt = $this->pdo->prepare("UPDATE `cc_certificate_order` SET `certificate_status` = ? WHERE `id` = ?");
        $stmt->execute([$certificateStatus, $id]);
    }
}
