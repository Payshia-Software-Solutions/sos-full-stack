<?php

class StudentPaymentNew
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get payment statistics
    public function getPaymentStats($courseCode = null)
    {
        if ($courseCode) {
            // 1. Get total enrollments
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM student_course WHERE course_code = ?");
            $stmt->execute([$courseCode]);
            $enrollments = (int)$stmt->fetchColumn();

            // 2. Get course fees
            $stmt = $this->pdo->prepare("SELECT course_fee, registration_fee FROM course WHERE course_code = ?");
            $stmt->execute([$courseCode]);
            $courseInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            $c_fee = $courseInfo ? (float)$courseInfo['course_fee'] : 0;
            $r_fee = $courseInfo ? (float)$courseInfo['registration_fee'] : 0;
            
            $total_expected = $enrollments * ($c_fee + $r_fee);

            // 3. Get total paid
            $stmt = $this->pdo->prepare("SELECT SUM(paid_amount) FROM student_payment WHERE course_code = ?");
            $stmt->execute([$courseCode]);
            $total_paid = (float)$stmt->fetchColumn();

        } else {
            // 1. Get total enrollments across all
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM student_course");
            $stmt->execute();
            $enrollments = (int)$stmt->fetchColumn();

            // 2. Calculate expected dynamically across all courses
            $sql = "SELECT SUM(IFNULL(c.course_fee, 0) + IFNULL(c.registration_fee, 0)) 
                    FROM student_course sc
                    JOIN course c ON sc.course_code = c.course_code";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $total_expected = (float)$stmt->fetchColumn();

            // 3. Get total paid across all
            $stmt = $this->pdo->prepare("SELECT SUM(paid_amount) FROM student_payment");
            $stmt->execute();
            $total_paid = (float)$stmt->fetchColumn();
        }

        $total_due = $total_expected - $total_paid;

        return [
            'total_enrollments' => $enrollments,
            'total_expected' => $total_expected,
            'total_paid' => $total_paid,
            'total_due' => $total_due
        ];
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

    // Get student payments by student ID and course code
    public function getByStudentIdAndCourse($studentId, $courseCode)
    {
        // Resolve student_id if username was passed (e.g. PA36398 -> PA/36/398)
        $stmtStudent = $this->pdo->prepare("SELECT `student_id` FROM `user_full_details` WHERE `username` = ? OR `student_id` = ?");
        $stmtStudent->execute([$studentId, $studentId]);
        $studentRow = $stmtStudent->fetch(PDO::FETCH_ASSOC);
        
        $resolvedStudentId = $studentRow ? $studentRow['student_id'] : $studentId;

        $stmt = $this->pdo->prepare("SELECT * FROM `student_payment` WHERE (`student_id` = ? OR `student_id` = ?) AND `course_code` = ?");
        $stmt->execute([$resolvedStudentId, $studentId, $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
