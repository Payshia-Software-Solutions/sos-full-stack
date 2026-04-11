<?php

class ECertificate
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all certificates
    public function getAllCertificates()
    {
        $stmt = $this->pdo->query("SELECT * FROM ecertificate");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a certificate by ID
    public function getCertificateById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ecertificate WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get certificates by student number
    public function getCertificatesByStudentNumber($student_number)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ecertificate WHERE student_number = :student_number");
        $stmt->execute(['student_number' => $student_number]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }




    // Get certificates by course code
    public function getCertificatesByCourseCode($course_code)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ecertificate WHERE course_code = :course_code");
        $stmt->execute(['course_code' => $course_code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create a new certificate
    public function createCertificate($data)
    {
        // Generate unique_number if not provided
        if (!isset($data['unique_number'])) {
            $data['unique_number'] = time() . rand(1000, 9999);  // Example unique number generation
        }

        $sql = "INSERT INTO ecertificate (student_number, course_code, generated_image_name, created_at, created_by, unique_number) 
                VALUES (:student_number, :course_code, :generated_image_name, :created_at, :created_by, :unique_number)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);  // Returns true/false
    }

    // Update a certificate by ID
    public function updateCertificate($id, $data)
    {
        $sql = "UPDATE ecertificate SET 
                    student_number = :student_number, 
                    course_code = :course_code, 
                    generated_image_name = :generated_image_name, 
                    unique_number = :unique_number,
                    created_at = :created_at, 
                    created_by = :created_by
                WHERE id = :id";
        $data['id'] = $id;
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($data);  // Returns true/false
    }

    // Delete a certificate by ID
    public function deleteCertificate($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM ecertificate WHERE id = :id");
        return $stmt->execute(['id' => $id]);  // Returns true/false
    }



    public function getCertificatesByStudentNumberAndCourseCode($student_number, $course_code)
    {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM ecertificate WHERE student_number = :student_number AND course_code = :course_code");
            $stmt->execute(['student_number' => $student_number, 'course_code' => $course_code]);
    
            // Log the SQL query and parameters for debugging
            error_log("Query: " . $stmt->queryString);
            error_log("Params: " . json_encode(['student_number' => $student_number, 'course_code' => $course_code]));
    
            // Check if any rows are fetched
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (empty($result)) {
                error_log("No records found.");
            }
    
            return $result;
        } catch (Exception $e) {
            error_log("Exception: " . $e->getMessage());
            return [];
        }
    }
    
    

}
