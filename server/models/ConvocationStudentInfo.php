<?php
// models/ConvocationStudentInfo.php

class ConvocationStudentInfo
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllStudentInfo()
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `convocation_id`, `student_number`, `ceremony_number` FROM `convocation_student_info` ORDER BY `id` DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStudentInfoById($id)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `convocation_id`, `student_number`, `ceremony_number` FROM `convocation_student_info` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStudentInfoByConvocationId($convocationId)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `convocation_id`, `student_number`, `ceremony_number` FROM `convocation_student_info` WHERE `convocation_id` = ? ORDER BY `student_number` ASC");
        $stmt->execute([$convocationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStudentInfoByNumber($studentNumber, $convocationId)
    {
        $stmt = $this->pdo->prepare("SELECT `id`, `convocation_id`, `student_number`, `ceremony_number` FROM `convocation_student_info` WHERE `student_number` = ? AND `convocation_id` = ?");
        $stmt->execute([$studentNumber, $convocationId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createStudentInfo($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `convocation_student_info` (`convocation_id`, `student_number`, `ceremony_number`) VALUES (?, ?, ?)");
        return $stmt->execute([
            $data['convocation_id'],
            $data['student_number'],
            $data['ceremony_number']
        ]);
    }

    public function batchInsertStudentInfo($studentList)
    {
        if (empty($studentList)) return true;

        $sql = "INSERT INTO `convocation_student_info` (`convocation_id`, `student_number`, `ceremony_number`) VALUES ";
        $placeholders = [];
        $values = [];

        foreach ($studentList as $student) {
            $placeholders[] = "(?, ?, ?)";
            $values[] = $student['convocation_id'];
            $values[] = $student['student_number'];
            $values[] = $student['ceremony_number'];
        }

        $sql .= implode(", ", $placeholders);
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }

    public function updateStudentInfo($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `convocation_student_info` SET `convocation_id` = ?, `student_number` = ?, `ceremony_number` = ? WHERE `id` = ?");
        return $stmt->execute([
            $data['convocation_id'],
            $data['student_number'],
            $data['ceremony_number'],
            $id
        ]);
    }

    public function deleteStudentInfo($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `convocation_student_info` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }
}
