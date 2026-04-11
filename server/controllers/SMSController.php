<?php
// controllers/SMSController.php

require_once './models/SMSModel.php';

class SMSController
{
    private $smsModel;

    public function __construct($authToken, $senderId, $templatePath)
    {
        $this->smsModel = new SMSModel($authToken, $senderId, $templatePath);
    }

    public function sendSMS($mobile, $senderId = 'Pharma C.', $message = "Waiting..!")
    {
        try {
            // Validate mobile number
            if (empty($mobile) || !preg_match('/^\d{10}$/', $mobile)) {
                http_response_code(400); // Bad Request
                echo json_encode(['status' => 'error', 'message' => 'Invalid mobile number']);
                return;
            }

            // Send SMS using the model
            $response = $this->smsModel->sendSMS($mobile, $senderId, $message);

            // Check the response from the SMS model
            if ($response['status'] === 'error') {
                http_response_code(500); // Internal Server Error
                echo json_encode(['status' => 'error', 'message' => $response['message']]);
            } else {
                http_response_code(200); // OK
                echo json_encode(['status' => 'success', 'message' => 'SMS sent successfully', 'data' => $response]);
            }
        } catch (Exception $e) {
            // Handle unexpected errors
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
        }
    }

    public function sendWelcomeSMS($mobile, $studentName, $referenceNumber)
    {
        try {
            $response = $this->smsModel->sendWelcomeSMS($mobile, $studentName, $referenceNumber);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function sendOrderSMS($mobile, $studentName)
    {
        try {
            $response = $this->smsModel->sendOrderSMS($mobile, $studentName);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function sendNameOnCertificateSMS($mobile, $studentName, $studenNumber)
    {
        try {
            // Validate inputs
            if (empty($mobile) || empty($studentName) || empty($studenNumber)) {
                throw new Exception("Mobile number, student name, and student number are required.");
            }

            // Call model method to send SMS
            $response = $this->smsModel->sendNameOnCertificateSMS($mobile, $studentName, $studenNumber);

            // Return success response
            echo json_encode(['status' => 'success', 'message' => 'SMS sent successfully', 'data' => $response]);
        } catch (Exception $e) {
            // Return error response with HTTP 400
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
