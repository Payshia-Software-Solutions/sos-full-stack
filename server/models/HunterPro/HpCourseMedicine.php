<?php

class HpCourseMedicine
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllRecords()
    {
        $stmt = $this->pdo->query("SELECT * FROM hp_course_medicine");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecordById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hp_course_medicine WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getRecordByCourseCode($course_code)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hp_course_medicine WHERE CourseCode = :course_code");
        $stmt->execute(['course_code' => $course_code]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createRecord($data)
    {
        $sql = "INSERT INTO hp_course_medicine (CourseCode, MediID, status) 
                VALUES (:CourseCode, :MediID, :status)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateRecord($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE hp_course_medicine SET 
                    CourseCode = :CourseCode, 
                    MediID = :MediID, 
                    status = :status
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteRecord($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM hp_course_medicine WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
