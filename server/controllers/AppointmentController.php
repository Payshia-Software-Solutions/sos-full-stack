<?php
// controllers/AppointmentController.php

require_once './models/Appointment.php';
require_once './models/User.php';
require_once './models/UserFullDetails.php';

class AppointmentController
{
    private $model;
    private $userModel;
    private $userDetailsModel;

    public function __construct($pdo)
    {
        $this->model = new Appointment($pdo);
        $this->userModel = new User($pdo);
        $this->userDetailsModel = new UserFullDetails($pdo);
    }

    public function getAppointments()
    {
        $appointments = $this->model->getAllAppointments();
        echo json_encode($appointments);
    }

    public function getAppointment($id)
    {
        $appointment = $this->model->getAppointmentById($id);
        echo json_encode($appointment);
    }

    public function getAppointmentsByusername($username) 
    {
        // Get user information based on username
        $user = $this->userModel->getByUsername($username);
        $userName = $user['username'];
    
        $usersAppointments = [];
        // Fetch all appointments
        $appointments = $this->model->getAllAppointments();
    
        // Loop through all appointments
        foreach ($appointments as $appointment) {
            // Check if the appointment belongs to the current user
            if ($appointment['student_number'] === $userName) {
               
                $appointment['instructor_name'] = $this->getUserName($appointment['instructor_id']);
                $appointment['image'] = $this->getUserImage($appointment['instructor_id']);
                
                $usersAppointments[] = $appointment;
            }
        }
    
        // Return the user's appointments as JSON
        echo json_encode($usersAppointments);
    }
    
    // Function to get the instructor's full name by ID
    public function getUserName($id) {
        $user = $this->userDetailsModel->getUserById($id);
        return $user['first_name']." ".$user['last_name'];
    }

    public function getUserImage($id) {
        $user = $this->userModel->getUserById($id);
        return $user['image'];
    }
    
    public function createAppointment()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->createAppointment($data);
        echo json_encode(['status' => 'Appointment created']);
    }

    public function updateAppointment($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->updateAppointment($id, $data);
        echo json_encode(['status' => 'Appointment updated']);
    }

    public function deleteAppointment($id)
    {
        $this->model->deleteAppointment($id);
        echo json_encode(['status' => 'Appointment deleted']);
    }
}