<?php

use Carbon\Carbon;

class Course
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM course");
        $courses = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $courseCode = $row['course_code'];
            $courses[$courseCode] = $row;
        }

        return $courses;
    }


    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course WHERE id = :id AND display = 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getRecordByParentId($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM course WHERE parent_course_id = :parent_course_id");
        $stmt->execute(['parent_course_id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // public function getCourseFeeByCourseCode($course_code)
    // {
    //     $query = "
    //     SELECT course_fee
    //     FROM course
    //     WHERE course_code = :course_code
    // ";

    //     $stmt = $this->pdo->prepare($query);
    //     $stmt->execute(['course_code' => $course_code]);

    //     return $stmt->fetch(PDO::FETCH_ASSOC);
    // }

    public function createRecord($data)
    {
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }

        $sql = "INSERT INTO course 
                (course_name, course_code, instructor_id, course_description, course_duration, course_fee, registration_fee, other, created_at, created_by, enroll_key, certification, mini_description, course_img, CertificateImagePath) 
                VALUES 
                (:course_name, :course_code, :instructor_id, :course_description, :course_duration, :course_fee, :registration_fee, :other, :created_at, :created_by, :enroll_key, :certification, :mini_description, :course_img, :CertificateImagePath)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        if (!isset($data['update_at'])) {
            $data['update_at'] = date('Y-m-d H:i:s');
        }

        $data['id'] = $id;

        $sql = "UPDATE course SET 
                    course_name = :course_name, 
                    course_code = :course_code, 
                    instructor_id = :instructor_id,
                    course_description = :course_description, 
                    course_duration = :course_duration,
                    course_fee = :course_fee, 
                    registration_fee = :registration_fee,
                    other = :other,
                    update_by = :update_by, 
                    update_at = :update_at,
                    enroll_key = :enroll_key,
                    certification = :certification,
                    mini_description = :mini_description,
                    course_img = :course_img,
                    CertificateImagePath = :CertificateImagePath
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("UPDATE course SET display = 0 WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function getRecordByCourseCode($course_code)
    {
        $query = "SELECT * FROM course WHERE course_code = :course_code";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute(['course_code' => $course_code]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            error_log("Query successful, found record: " . json_encode($result));
            return [$course_code => $result]; // Keyed by course_code
        } else {
            error_log("Query returned no results for course_code: $course_code");
            return []; // Return empty array if no result
        }
    }
}
