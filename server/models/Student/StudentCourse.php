<?php

class StudentCourse
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all records
    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM student_course");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get a single record by ID
    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student_course WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get LMS student details by username
    public function getLmsStudentByUsername($userName)
    {
        $cleanUsername = rtrim($userName, "/");
        $stmt = $this->pdo->prepare("SELECT * FROM user_full_details WHERE username = :username");
        $stmt->execute(['username' => $cleanUsername]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }



    // Create a new record
    public function createRecord($data)
    {
        $sql = "INSERT INTO student_course (course_code, student_id, enrollment_key) 
                VALUES (:course_code, :student_id, :enrollment_key)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Update an existing record by ID
    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE student_course SET 
                    course_code = :course_code,
                    student_id = :student_id,
                    enrollment_key = :enrollment_key
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    // Delete a record by ID
    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM student_course WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    // Get records by course code
    public function getRecordsByCourseCode($courseCode)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student_course WHERE course_code = :course_code");
        $stmt->execute(['course_code' => $courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get records by student ID
    public function getRecordsByStudentId($userName)
    {

        $studentId = $this->getLmsStudentByUsername($userName)['student_id'];
        $stmt = $this->pdo->prepare("
            SELECT sc.*, pmc.id AS parent_course_id
            FROM student_course sc
            LEFT JOIN parent_main_course pmc ON sc.course_code = pmc.course_code
            WHERE sc.student_id = :student_id
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
