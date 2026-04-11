<?php
// routes/EmailRoutes.php

require_once './controllers/EmailController.php';
require_once './vendor/autoload.php';

use Dotenv\Dotenv;

// Load .env variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Fetch values from .env
$host = $_ENV['SMTP_HOST'];
$username = $_ENV['SMTP_USERNAME'];
$password = $_ENV['SMTP_PASSWORD'];

// Define template
$fromEmail = 'info@pharmacollege.lk';
$fromName = 'Ceylon Pharma College';
$templatePath = './email_templates/welcome.html';

// Instantiate the EmailController
$emailController = new EmailController($host, $username, $password, $fromEmail, $fromName, $templatePath);

// Define the routes
return [
    'POST /send-email/$' => function () use ($emailController) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['toEmail'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Recipient email is required']);
            return;
        }

        $toEmail = $data['toEmail'];
        $subject = $data['subject'] ?? 'Notification';
        $body = $data['body'] ?? 'Hello, this is a default message.';

        $emailController->sendEmail($toEmail, $subject, $body);
    },

    'POST /send-welcome-email/$' => function () use ($emailController) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['toEmail']) || !isset($data['studentName']) || !isset($data['referenceNumber'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'toEmail, studentName, and referenceNumber are required']);
            return;
        }

        $emailController->sendWelcomeEmail($data['toEmail'], $data['studentName'], $data['referenceNumber']);
    },
];
