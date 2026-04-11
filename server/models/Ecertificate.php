<?php
// models/ECertificate.php

class ECertificate
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCertificates()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `e-certificate`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCourseCompletion($course_code, $username)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `index_number`, `course_code`, `title_id`, `result`, `created_at`, `created_by` FROM `certificate_user_result` WHERE `course_code` = ? AND `index_number` = ? ");
        $stmt->execute([$course_code, $username]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCourseCompletionByTitle($course_code, $username, $title)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `index_number`, `course_code`, `title_id`, `result`, `created_at`, `created_by` FROM `certificate_user_result` WHERE `course_code` = ? AND `index_number` = ? AND `title_id` LIKE ?");
        $stmt->execute([$course_code, $username, $title]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCertificateById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `e-certificate` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCertificate($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `e-certificate` (`certificate_id`, `student_number`, `generate_date`, `is_active`, `course_code`) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['certificate_id'],
            $data['student_number'],
            $data['generate_date'],
            $data['is_active'],
            $data['course_code']
        ]);
    }

    public function updateCertificate($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `e-certificate` SET `certificate_id` = ?, `student_number` = ?, `generate_date` = ?, `is_active` = ?, `course_code` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['certificate_id'],
            $data['student_number'],
            $data['generate_date'],
            $data['is_active'],
            $data['course_code'],
            $id
        ]);
    }

    public function deleteCertificate($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `e-certificate` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
