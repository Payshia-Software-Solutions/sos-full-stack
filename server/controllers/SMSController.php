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

    private function formatMobileNumber($mobile)
    {
        $mobile = preg_replace('/[^0-9]/', '', (string)$mobile);
        if (strpos($mobile, '94') === 0 && strlen($mobile) === 11) {
            $mobile = '0' . substr($mobile, 2);
        } elseif (strlen($mobile) === 9 && strpos($mobile, '0') !== 0) {
            $mobile = '0' . $mobile;
        }
        return $mobile;
    }

    public function sendSMS($mobile, $senderId = 'Pharma C.', $message = "Waiting..!")
    {
        try {
            $mobile = $this->formatMobileNumber($mobile);

            // Validate mobile number (must be 10 digits starting with 0)
            if (empty($mobile) || !preg_match('/^0\d{9}$/', $mobile)) {
                http_response_code(400); // Bad Request
                echo json_encode(['status' => 'error', 'message' => 'Invalid mobile number. Sri Lankan numbers must be 10 digits starting with 0.']);
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
            $mobile = $this->formatMobileNumber($mobile);
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
            $mobile = $this->formatMobileNumber($mobile);
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
            $mobile = $this->formatMobileNumber($mobile);
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
