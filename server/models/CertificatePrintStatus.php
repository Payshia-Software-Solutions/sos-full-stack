<?php
// models/CertificatePrintStatus.php

class CertificatePrintStatus
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getByCourseCode($courseCode)
    {
        $stmt = $this->pdo->prepare("
            SELECT 
                ucp.student_number,
                ufd.full_name,
                ufd.name_on_certificate,
                ucp.course_code,
                ucp.type AS document_type,
                ucp.print_status,
                ucp.certificate_id,
                sc.enrollment_key
            FROM `user_certificate_print_status` AS ucp
            JOIN `user_full_details` AS ufd 
                ON ucp.student_number = ufd.username
            JOIN `student_course` AS sc 
                ON ufd.student_id = sc.student_id 
                AND ucp.course_code = sc.course_code
            WHERE ucp.course_code = ?
            ORDER BY ufd.full_name ASC, ucp.type ASC;
        ");
        $stmt->execute([$courseCode]);
        return $stmt->fetchAll();
    }
}
