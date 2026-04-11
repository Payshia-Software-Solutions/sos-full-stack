<?php
// models/Appointment.php

class Appointment
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllAppointments()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `appointments`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAppointmentById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `appointments` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createAppointment($data)
{
    $stmt = $this->pdo->prepare("INSERT INTO `appointments` (`appointment_id`, `student_number`, `booking_date`, `booked_time`, `reason`, `category`, `created_at`, `status`, `comment`, `is_active`, `instructor_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['appointment_id'],
        $data['student_number'],
        $data['booking_date'],
        $data['booked_time'],
        $data['reason'],
        $data['category'],
        $data['created_at'],
        $data['status'],
        $data['comment'],
        $data['is_active'],
        $data['instructor_id']  
    ]);
}


    public function updateAppointment($id, $data)
    {
        $stmt = $this->pdo->prepare("UPDATE `appointments` SET `appointment_id` = ?, `student_number` = ?, `booking_date` = ?, `booked_time` = ?, `reason` = ?, `category` = ?, `created_at` = ?, `status` = ?, `comment` = ?, `is_active` = ? WHERE `id` = ?");
        $stmt->execute([
            $data['appointment_id'],
            $data['student_number'],
            $data['booking_date'],
            $data['booked_time'],
            $data['reason'],
            $data['category'],
            $data['created_at'],
            $data['status'],
            $data['comment'],
            $data['is_active'],
            $id
        ]);
    }

    public function deleteAppointment($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `appointments` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}