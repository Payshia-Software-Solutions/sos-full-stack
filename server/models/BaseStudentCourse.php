<?php

class BaseStudentCourse
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllEnrollments()
    {
        $stmt = $this->pdo->query("SELECT * FROM student_course ORDER BY `id` DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllEnrollmentsByCourse($course_code)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student_course WHERE course_code = :course_code ORDER BY `id` DESC");
        $stmt->execute(['course_code' => $course_code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEnrollmentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student_course WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStudentIdByUsername($username)
    {
        $stmt = $this->pdo->prepare("SELECT userid FROM users WHERE username = :username");
        $stmt->execute(['username' => $username]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? $result['userid'] : null;
    }


    public function getEnrollmentByUsername($username)
    {
        // First, get the student ID using the username
        $student_id = $this->getStudentIdByUsername($username);

        if ($student_id === null) {
            return null; // or handle the case where the student ID is not found
        }

        // Now, get the enrollment details using the student ID
        $stmt = $this->pdo->prepare("SELECT * FROM student_course WHERE student_id = :student_id");
        $stmt->execute(['student_id' => $student_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function createEnrollment($data)
    {
        $sql = "INSERT INTO student_course (course_code, student_id, enrollment_key, created_at) 
                VALUES (:course_code, :student_id, :enrollment_key, :created_at)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateEnrollment($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE student_course SET 
                    course_code = :course_code, 
                    student_id = :student_id, 
                    enrollment_key = :enrollment_key, 
                    created_at = :created_at
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }



    public function deleteEnrollment($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM student_course WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
