<?php
// models/CertificateOrder.php

class CertificateOrder
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Read all certificate orders
    public function getAllOrders()
    {
        $sql = "SELECT 
            o.`id`, 
            o.`created_by`, 
            o.`created_at`, 
            o.`updated_at`, 
            o.`course_code`, 
            o.`mobile`, 
            o.`address_line1`, 
            o.`address_line2`, 
            o.`city_id`, 
            o.`district`, 
            o.`type`, 
            o.`payment`, 
            o.`package_id`, 
            o.`certificate_id`, 
            o.`certificate_status`, 
            o.`advanced_id`, 
            o.`advanced_id_status`, 
            o.`cod_amount`, 
            o.`is_active`,
            o.`garlent`,
            o.`scroll`,
            o.`certificate_file`,
            o.`payment_slip`,
            u.`name_on_certificate`,
            u.`telephone_1`,
            o.`print_status`
        FROM 
            `cc_certificate_order` o
        LEFT JOIN 
            `user_full_details` u ON o.`created_by` = u.`username`
        ORDER BY 
            o.`id`;
        ";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrdersWithCourseCode($courseCode)
    {
        $sql = "SELECT 
            o.`id`, 
            o.`created_by`, 
            o.`created_at`, 
            o.`updated_at`, 
            o.`course_code`, 
            o.`mobile`, 
            o.`address_line1`, 
            o.`address_line2`, 
            o.`city_id`, 
            o.`district`, 
            o.`type`, 
            o.`payment`, 
            o.`package_id`, 
            o.`certificate_id`, 
            o.`certificate_status`, 
            o.`advanced_id`, 
            o.`advanced_id_status`, 
            o.`cod_amount`, 
            o.`is_active`,
            o.`garlent`,
            o.`scroll`,
            o.`certificate_file`,
            o.`payment_slip`,
            u.`name_on_certificate`,
            u.`telephone_1`
        FROM 
            `cc_certificate_order` o
        LEFT JOIN 
            `user_full_details` u ON o.`created_by` = u.`username`
        WHERE 
            FIND_IN_SET(?, o.`course_code`)
        ORDER BY 
            o.`id`";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrdersByStudentNumber($studentNumber)
    {
        $sql = "SELECT 
            o.`id`, 
            o.`created_by`, 
            o.`created_at`, 
            o.`updated_at`, 
            o.`course_code`, 
            o.`mobile`, 
            o.`address_line1`, 
            o.`address_line2`, 
            o.`city_id`, 
            o.`district`, 
            o.`type`, 
            o.`payment`, 
            o.`package_id`, 
            o.`certificate_id`, 
            o.`certificate_status`, 
            o.`advanced_id`, 
            o.`advanced_id_status`, 
            o.`cod_amount`, 
            o.`is_active`,
            o.`garlent`,
            o.`scroll`,
            o.`certificate_file`,
            o.`payment_slip`,
            u.`name_on_certificate`,
            u.`telephone_1`
        FROM
            `cc_certificate_order` o
        LEFT JOIN
            `user_full_details` u ON o.`created_by` = u.`username`
        WHERE
            u.`username` = ?
        ORDER BY
            o.`id`";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$studentNumber]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create a new certificate order
    public function createOrder($created_by, $course_code, $mobile, $address_line1, $address_line2, $city_id, $district, $type, $payment, $package_id, $certificate_id, $certificate_status, $cod_amount, $is_active, $garlent, $scroll, $certificate_file, $payment_slip)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO cc_certificate_order (created_by, course_code, mobile, address_line1, address_line2, city_id,district, type, payment, package_id, certificate_id, certificate_status, cod_amount, is_active, garlent, scroll, certificate_file, payment_slip)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$created_by, $course_code, $mobile, $address_line1, $address_line2, $city_id, $district, $type, $payment, $package_id, $certificate_id, $certificate_status, $cod_amount, $is_active, $garlent, $scroll, $certificate_file, $payment_slip]);

        $order_id = $this->pdo->lastInsertId();
        return $order_id;
    }

    // Read a single certificate order by ID
    public function getOrderById($order_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cc_certificate_order WHERE id = ?");
        $stmt->execute([$order_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Read a single certificate order by Certificate ID
    public function getOrderByCertificateId($certificate_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cc_certificate_order WHERE certificate_id = ?");
        $stmt->execute([$certificate_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update a certificate order
    public function updateOrder($order_id, $created_by, $course_code, $mobile, $address_line1, $address_line2, $city_id, $district, $type, $payment, $package_id, $certificate_id, $certificate_status, $cod_amount, $is_active, $garlent, $scroll, $certificate_file, $payment_slip)
    {
        if ($payment_slip) {
            $stmt = $this->pdo->prepare("
                UPDATE cc_certificate_order 
                SET created_by = ?, course_code = ?, mobile = ?, address_line1 = ?, address_line2 = ?, city_id = ?,district=?, type = ?, payment = ?, package_id = ?, certificate_id = ?, certificate_status = ?, cod_amount = ?, is_active = ?, garlent = ?, scroll = ?, certificate_file = ?, payment_slip = ?
                WHERE id = ?
            ");
            return $stmt->execute([$created_by, $course_code, $mobile, $address_line1, $address_line2, $city_id, $district, $type, $payment, $package_id, $certificate_id, $certificate_status, $cod_amount, $is_active, $garlent, $scroll, $certificate_file, $payment_slip, $order_id]);
        } else {
            $stmt = $this->pdo->prepare("
                UPDATE cc_certificate_order 
                SET created_by = ?, course_code = ?, mobile = ?, address_line1 = ?, address_line2 = ?, city_id = ?,district=?, type = ?, payment = ?, package_id = ?, certificate_id = ?, certificate_status = ?, cod_amount = ?, is_active = ?, garlent = ?, scroll = ?, certificate_file = ?
                WHERE id = ?
            ");
            return $stmt->execute([$created_by, $course_code, $mobile, $address_line1, $address_line2, $city_id, $district, $type, $payment, $package_id, $certificate_id, $certificate_status, $cod_amount, $is_active, $garlent, $scroll, $certificate_file, $order_id]);
        }
    }

    // Delete a certificate order
    public function deleteOrder($order_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM cc_certificate_order WHERE id = ?");
        return $stmt->execute([$order_id]);
    }

    // Validate duplicate order by Certificate ID
    public function validateDuplicate($certificate_id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cc_certificate_order WHERE certificate_id = ?");
        $stmt->execute([$certificate_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update courses in a certificate order
    public function updateCourses($orderId, $courses)
    {
        $stmt = $this->pdo->prepare("UPDATE cc_certificate_order SET course_code = ? WHERE id = ?");
        return $stmt->execute([$courses, $orderId]);
    }
}
