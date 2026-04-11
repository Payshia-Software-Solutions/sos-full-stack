<?php

class StudentPaymentNew
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all student payments
    public function getAll()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `student_payment`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get student payment by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `student_payment` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create new student payment
    public function create($data)
    {
        // Generate receipt number with timestamp (e.g., CPCREC1628194738)
        $receiptNumber = 'CPCREC' . time();

        // Get current date and time for created_at
        $createdAt = date('Y-m-d H:i:s');

        // Prepare the SQL statement
        $stmt = $this->pdo->prepare("INSERT INTO `student_payment` 
        (`receipt_number`, `course_code`, `student_id`, `paid_amount`, `discount_amount`, `payment_status`, `payment_type`, `paid_date`, `created_at`, `created_by`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        // Execute the statement with the data
        $stmt->execute([
            $receiptNumber,
            $data['course_code'],
            $data['student_id'],
            $data['paid_amount'],
            $data['discount_amount'],
            $data['payment_status'],
            $data['payment_type'],
            $data['paid_date'],
            $createdAt,
            $data['created_by']
        ]);

        // Return the last inserted ID (primary key)
        return $this->pdo->lastInsertId();
    }


    // Update student payment
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `student_payment` SET `receipt_number` = ?, `course_code` = ?, `student_id` = ?, `paid_amount` = ?, `discount_amount` = ?, 
                                    `payment_status` = ?, `payment_type` = ?, `paid_date` = ?, `created_at` = ?, `created_by` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['receipt_number'],
            $data['course_code'],
            $data['student_id'],
            $data['paid_amount'],
            $data['discount_amount'],
            $data['payment_status'],
            $data['payment_type'],
            $data['paid_date'],
            $data['created_at'],
            $data['created_by'],
            $id
        ]);
    }

    // Delete student payment
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `student_payment` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
