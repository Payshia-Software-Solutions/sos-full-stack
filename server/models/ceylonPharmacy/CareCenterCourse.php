<?php
// models/ceylonPharmacy/CareCenterCourse.php

class CareCenterCourse
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCareCenterCourses()
    {
        $stmt = $this->pdo->query('SELECT * FROM care_center_course');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCareCenterCourseById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM care_center_course WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCareCenterCourse($data)
    {
        $stmt = $this->pdo->prepare('INSERT INTO care_center_course (CourseCode, prescription_id, status) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['CourseCode'],
            $data['prescription_id'],
            $data['status']
        ]);
        return $this->pdo->lastInsertId();
    }

    public function updateCareCenterCourse($id, $data)
    {
        $stmt = $this->pdo->prepare('UPDATE care_center_course SET CourseCode = ?, prescription_id = ?, status = ? WHERE id = ?');
        $stmt->execute([
            $data['CourseCode'],
            $data['prescription_id'],
            $data['status'],
            $id
        ]);
        return $stmt->rowCount();
    }

    public function deleteCareCenterCourse($id)
    {
        $stmt = $this->pdo->prepare('DELETE FROM care_center_course WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    public function getPrescriptionIdsByCourseCode($courseCode)
    {
        $stmt = $this->pdo->prepare('SELECT prescription_id FROM care_center_course WHERE CourseCode = ? AND status = \'Active\'');
        $stmt->execute([$courseCode]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
