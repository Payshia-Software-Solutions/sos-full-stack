<?php
// routes/SMSRoutes.php

require_once './controllers/SMSController.php';

// Instantiate the SMSController
$smsController = new SMSController($authToken, $senderId, $templatePath);

// Define the routes
return [
    'POST /send-sms/$' => function () use ($smsController) {
        // Get JSON input from the request body
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (!isset($data['mobile'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Mobile number is required']);
            return;
        }

        $mobile = $data['mobile'];
        $senderId = $data['senderId'] ?? 'Pharma C.';
        $message = $data['message'] ?? "Waiting..!";

        // Call the controller method
        $smsController->sendSMS($mobile, $senderId, $message);
    },

    'POST /send-welcome-sms/$' => function () use ($smsController) {
        // Get JSON input from the request body
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (!isset($data['mobile']) || !isset($data['studentName']) || !isset($data['referenceNumber'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Mobile, studentName, and referenceNumber are required']);
            return;
        }

        // Call the controller method
        $smsController->sendWelcomeSMS($data['mobile'], $data['studentName'], $data['referenceNumber']);
    },

    'POST /send-order-sms/$' => function () use ($smsController) {
        // Get JSON input from the request body
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (!isset($data['mobile'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Mobile number and orderId are required']);
            return;
        }

        // Call the controller method
        $smsController->sendOrderSMS($data['mobile'], $data['studentName'] ?? 'Student');
    },

    // Name SMS for Certificate
    'POST /send-name-sms/$' => function () use ($smsController) {
        // Get JSON input from the request body
        $data = json_decode(file_get_contents('php://input'), true);

        // Basic input validation with reusable helper
        function respondWithError($message)
        {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $message]);
            exit;
        }

        // Validate input fields
        if (empty($data['mobile'])) {
            respondWithError('Mobile number is required');
        }

        if (empty(trim($data['studentNameOnCertificate'] ?? ''))) {
            respondWithError('Student name on certificate is required');
        }

        if (empty(trim($data['studenNumber'] ?? ''))) {
            respondWithError('Student number is required');
        }

        // All validated — call the controller
        $smsController->sendNameOnCertificateSMS(
            $data['mobile'],
            $data['studentNameOnCertificate'],
            $data['studenNumber']
        );
    }



];
