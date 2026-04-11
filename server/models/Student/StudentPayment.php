<?php

use Carbon\Carbon;

class StudentPayment
{
    private $pdo;
    private $userModel;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->userModel = new User($pdo);
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM student_payment");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student_payment WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getRecordByUser($studentNumber)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student_payment WHERE `student_id` = :studentNumber");
        $stmt->execute(['studentNumber' => $studentNumber]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }

        $sql = "INSERT INTO student_payment 
                (receipt_number, course_code, student_id, paid_amount, discount_amount, payment_status, payment_type, paid_date, created_at, created_by, reason) 
                VALUES 
                (:receipt_number, :course_code, :student_id, :paid_amount, :discount_amount, :payment_status, :payment_type, :paid_date, :created_at, :created_by, :reason)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        if (!isset($data['update_at'])) {
            $data['update_at'] = date('Y-m-d H:i:s');
        }

        $data['id'] = $id;

        $sql = "UPDATE student_payment SET 
                    receipt_number = :receipt_number, 
                    course_code = :course_code, 
                    student_id = :student_id,
                    paid_amount = :paid_amount, 
                    discount_amount = :discount_amount,
                    payment_status = :payment_status, 
                    payment_type = :payment_type,
                    paid_date = :paid_date,
                    update_at = :update_at,
                    reason = :reason
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM student_payment WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    private function generateNextReceiptNumber()
    {
        // Query the last receipt_number
        $sql = "SELECT receipt_number FROM student_payment ORDER BY id DESC LIMIT 1";
        $stmt = $this->pdo->query($sql);
        $lastRecord = $stmt->fetch();

        if ($lastRecord) {
            // Extract the numeric part from the last receipt_number
            $lastReceiptNumber = $lastRecord['receipt_number'];
            $numberPart = intval(substr($lastReceiptNumber, 6)); // "CPCREC" is 6 characters

            // Increment the numeric part and concatenate with the prefix
            $newNumber = $numberPart + 1;
            return 'CPCREC' . $newNumber;
        } else {
            // If no records exist, start with CPCREC1
            return 'CPCREC1';
        }
    }

    public function createRecordAndUpdateStatus($data)
    {
        try {
            // Begin a transaction to ensure both updates happen together
            $this->pdo->beginTransaction();

            // Set 'Bank Transfer' as default if payment_type is not provided
            $paymentType = isset($data['payment_type']) ? $data['payment_type'] : 'Bank Transfer';

            // Retrieve student_id and user information using studentName
            $user = $this->userModel->getByUsername($data['student_name']);
            if (!$user) {
                throw new Exception("User not found with username: " . $data['created_by']);
            }

            $studentId = $user['userid']; // Assuming the user ID corresponds to the student_id

            // Generate the next receipt number
            $newReceiptNumber = $this->generateNextReceiptNumber();

            // Insert into student_payment table
            $sql = "INSERT INTO student_payment 
                    (receipt_number, course_code, student_id, paid_amount, discount_amount, payment_status, payment_type, paid_date, created_at, created_by, reason) 
                    VALUES 
                    (:receipt_number, :course_code, :student_id, :paid_amount, :discount_amount, :payment_status, :payment_type, :paid_date, :created_at, :created_by, :reason)";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'receipt_number' => $newReceiptNumber, // Use the newly generated receipt number
                'course_code' => $data['course_code'],
                'student_id' => $studentId, // Use the retrieved student ID
                'paid_amount' => $data['paid_amount'],
                'discount_amount' => 00.00,
                'payment_status' => $data['payment_status'],
                'payment_type' => $paymentType, // Use client provided or default 'Bank Transfer'
                'paid_date' => $data['paid_date'],
                'created_at' => $data['created_at'], // provided by the client
                'created_by' => $data['created_by'], // Now it's based on the username (client provided)
                'reason' => $data['reason']
            ]);

            // Update the status column in the payment_request table
            $updateSql = "UPDATE payment_request SET status = 1 WHERE id = :payment_request_id";
            $stmt = $this->pdo->prepare($updateSql);
            $stmt->execute([
                'payment_request_id' => $data['payment_request_id'] // client must pass the payment request ID
            ]);

            // Commit the transaction if both operations are successful
            $this->pdo->commit();

            return ['message' => 'Record created and status updated successfully with receipt number: ' . $newReceiptNumber];
        } catch (Exception $e) {
            // Rollback the transaction if something goes wrong
            $this->pdo->rollBack();
            throw new Exception("Error creating record and updating status: " . $e->getMessage());
        }
    }
}
