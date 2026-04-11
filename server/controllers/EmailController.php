<?php
// controllers/EmailController.php

require_once './models/EmailModel.php';

class EmailController
{
    private $emailModel;

    public function __construct($host, $username, $password, $fromEmail, $fromName, $templatePath)
    {
        $this->emailModel = new EmailModel($host, $username, $password, $fromEmail, $fromName, $templatePath);
    }

    public function sendEmail($toEmail, $subject = "Notification", $body = "Hello, this is a default message.")
    {
        try {
            if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400); // Bad Request
                echo json_encode(['status' => 'error', 'message' => 'Invalid email address']);
                return;
            }

            $mailer = $this->emailModel;
            $mailer->sendGenericEmail($toEmail, $subject, $body);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Email sent successfully.']);
        } catch (Exception $e) {
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function sendWelcomeEmail($toEmail, $studentName, $referenceNumber)
    {
        try {
            $response = $this->emailModel->sendWelcomeEmail($toEmail, $studentName, $referenceNumber);

            if ($response['status'] === 'success') {
                http_response_code(200);
            } else {
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to send welcome email: ' . $e->getMessage()]);
        }
    }
}
