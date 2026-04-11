<?php
// models/Convocation.php


class Convocation
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllConvocations()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `convocations`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getConvocationById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `convocations` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createConvocation($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO `convocations` (`convocation_name`, `held_on`, `session_count`, `parent_seats`, `student_seats`, `session_2`, `created_by`, `created_at`, `accept_booking`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['convocation_name'],
            $data['held_on'],
            $data['session_count'],
            $data['parent_seats'],
            $data['student_seats'],
            $data['session_2'],
            $data['created_by'],
            $data['created_at'],
            $data['accept_booking']
        ]);
    }

    public function updateConvocation($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `convocations` SET `convocation_name` = ?, `held_on` = ?, `session_count` = ?, `parent_seats` = ?, `student_seats` = ?, `session_2` = ?, `created_by` = ?, `created_at` = ?, `accept_booking` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['convocation_name'],
            $data['held_on'],
            $data['session_count'],
            $data['parent_seats'],
            $data['student_seats'],
            $data['session_2'],
            $data['created_by'],
            $data['created_at'],
            $data['accept_booking'],
            $id
        ]);
    }

    public function deleteConvocation($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `convocations` WHERE `id` = ?");
        $stmt->execute([$id]);
    }

    public function updateAcceptBooking($id, $status)
    {
        $stmt = $this->pdo->prepare("UPDATE `convocations` SET `accept_booking` = ? WHERE `id` = ?");
        $stmt->execute([$status, $id]);
        return $stmt->rowCount();
    }
}
