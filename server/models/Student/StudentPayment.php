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

            // We already receive student_id in the payload
            if (!isset($data['student_id'])) {
                throw new Exception("student_id is required");
            }
            $studentId = $data['student_id'];

            // Generate the next receipt number
            $newReceiptNumber = $this->generateNextReceiptNumber();

            // Insert into student_payment table
            $sql = "INSERT INTO student_payment 
                    (receipt_number, course_code, student_id, paid_amount, discount_amount, payment_status, payment_type, paid_date, created_at, created_by) 
                    VALUES 
                    (:receipt_number, :course_code, :student_id, :paid_amount, :discount_amount, :payment_status, :payment_type, :paid_date, :created_at, :created_by)";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'receipt_number' => $newReceiptNumber, // Use the newly generated receipt number
                'course_code' => $data['course_code'],
                'student_id' => $studentId, // Use the retrieved student ID
                'paid_amount' => $data['paid_amount'],
                'discount_amount' => $data['discount_amount'] ?? 0.00,
                'payment_status' => $data['payment_status'],
                'payment_type' => $paymentType, // Use client provided or default 'Bank Transfer'
                'paid_date' => $data['paid_date'],
                'created_at' => $data['created_at'], // provided by the client
                'created_by' => $data['created_by'], // Now it's based on the username (client provided)
            ]);

            // Update the status column in the payment_requests table if a request was selected
            if (!empty($data['payment_request_id'])) {
                $updateSql = "UPDATE payment_requests SET payment_status = 'Approved' WHERE id = :payment_request_id";
                $stmt = $this->pdo->prepare($updateSql);
                $stmt->execute([
                    'payment_request_id' => $data['payment_request_id']
                ]);
            }

            // Commit the transaction if both operations are successful
            $this->pdo->commit();

            // -------------------------------------------------------------
            // SEND SMS NOTIFICATION TO STUDENT
            // -------------------------------------------------------------
            try {
                // Fetch student info for SMS
                $stmtUser = $this->pdo->prepare("SELECT first_name, telephone_1 FROM user_full_details WHERE student_id = ? OR username = ?");
                $stmtUser->execute([$studentId, $studentId]);
                $userInfo = $stmtUser->fetch(PDO::FETCH_ASSOC);

                // Fetch course info for SMS
                $stmtCourse = $this->pdo->prepare("SELECT course_name FROM course WHERE course_code = ?");
                $stmtCourse->execute([$data['course_code']]);
                $courseName = $stmtCourse->fetchColumn();

                if ($userInfo && !empty($userInfo['telephone_1'])) {
                    require_once __DIR__ . '/../SMSModel.php';
                    $smsModel = new SMSModel($_ENV['SMS_AUTH_TOKEN'] ?? '', $_ENV['SMS_SENDER_ID'] ?? 'Pharma C.', '');
                    $smsModel->sendPaymentUpdateSMS(
                        $userInfo['telephone_1'],
                        $userInfo['first_name'] ?: 'Student',
                        $courseName ?: $data['course_code'],
                        $data['paid_amount'],
                        $newReceiptNumber
                    );
                }
            } catch (Exception $smsEx) {
                // Ignore SMS errors so it doesn't break the payment flow
            }
            // -------------------------------------------------------------

            return ['message' => 'Record created and status updated successfully with receipt number: ' . $newReceiptNumber];
        } catch (Exception $e) {
            // Rollback the transaction if something goes wrong
            $this->pdo->rollBack();
            throw new Exception("Error creating record and updating status: " . $e->getMessage());
        }
    }
}
