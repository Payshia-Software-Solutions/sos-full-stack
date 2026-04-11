<?php

class UserCertificatePrintStatus
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Fetch all records
    public function getAllRecords()
    {
        try {
            $stmt = $this->pdo->query("SELECT id, student_number, certificate_id, print_date, print_status, print_by, type, course_code FROM user_certificate_print_status");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fetch a record by ID
    public function getRecordById($id)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id, student_number, certificate_id, print_date, print_status, print_by, type, course_code FROM user_certificate_print_status WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fetch records by Student Number
    public function getRecordsByStudentNumber($studentNumber)
    {
        try {
            $stmt = $this->pdo->prepare("
            SELECT 
                u.id, 
                u.student_number, 
                u.certificate_id, 
                u.print_date, 
                u.print_status, 
                u.print_by, 
                u.type, 
                u.course_code,
                c.parent_course_id
            FROM 
                user_certificate_print_status u
            LEFT JOIN 
                course c ON u.course_code = c.course_code
            WHERE 
                u.student_number = :student_number
        ");
            $stmt->execute(['student_number' => $studentNumber]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fetch records by Student Number and CourseCode
    public function getRecordsByStudentNumberCourseCode($studentNumber, $courseCode)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id, student_number, certificate_id, print_date, print_status, print_by, type, course_code FROM user_certificate_print_status WHERE student_number = :student_number AND `course_code` = :course_code");
            $stmt->execute(['student_number' => $studentNumber, 'course_code' => $courseCode]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fetch records by Certificate ID
    public function getRecordsByCertificateId($certificateId)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id, student_number, certificate_id, print_date, print_status, print_by, type, course_code FROM user_certificate_print_status WHERE certificate_id = :certificate_id");
            $stmt->execute(['certificate_id' => $certificateId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Insert a new record
    public function createRecord($data)
    {
        try {
            $sql = "INSERT INTO user_certificate_print_status 
                    (student_number, certificate_id, print_date, print_status, print_by, type, course_code) 
                    VALUES 
                    (:student_number, :certificate_id, :print_date, :print_status, :print_by, :type, :course_code)";
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Update an existing record
    public function updateRecord($id, $data)
    {
        try {
            $data['id'] = $id;
            $sql = "UPDATE user_certificate_print_status SET 
                        student_number = :student_number, 
                        certificate_id = :certificate_id, 
                        print_date = :print_date, 
                        print_status = :print_status, 
                        print_by = :print_by, 
                        type = :type, 
                        course_code = :course_code 
                    WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Delete a record
    public function deleteRecord($id)
    {
        try {
            $stmt = $this->pdo->prepare("DELETE FROM user_certificate_print_status WHERE id = :id");
            return $stmt->execute(['id' => $id]);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // Fetch records by Print Status
    public function getRecordsByPrintStatus($printStatus)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT id, student_number, certificate_id, print_date, print_status, print_by, type, course_code FROM user_certificate_print_status WHERE print_status = :print_status");
            $stmt->execute(['print_status' => $printStatus]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getByStudentNumberCourseCodeAndType($studentNumber, $courseCode, $type)
    {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    id, 
                    student_number, 
                    certificate_id, 
                    print_date, 
                    print_status, 
                    print_by, 
                    type, 
                    course_code 
                FROM 
                    user_certificate_print_status 
                WHERE 
                    student_number = :student_number 
                    AND course_code = :course_code 
                    AND type = :type
            ");
            $stmt->execute([
                'student_number' => $studentNumber,
                'course_code' => $courseCode,
                'type' => $type
            ]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }

}
