<?php
// routes/appointmentRoutes.php

require_once './controllers/AppointmentController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$appointmentController = new AppointmentController($pdo);

// Define appointment routes
return [
    'GET /appointments/' => [$appointmentController, 'getAppointments'],
    'GET /appointments/{id}/' => [$appointmentController, 'getAppointment'],
    'GET /appointments/{username}/' => [$appointmentController, 'getAppointmentsByusername'],
    'POST /appointments/' => [$appointmentController, 'createAppointment'],
    'PUT /appointments/{id}/' => [$appointmentController, 'updateAppointment'],
    'DELETE /appointments/{id}/' => [$appointmentController, 'deleteAppointment']
];

?>