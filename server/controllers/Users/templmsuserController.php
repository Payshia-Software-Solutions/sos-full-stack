<?php

require_once './models/Users/TempLmsUser.php';
require_once './models/SMSModel.php';
require_once './models/EmailModel.php';

class TempLmsUserController
{
    private $model;
    private $smsModel;
    private $emailModel;
    private $templatePath;

    public function __construct($pdo, $templatePath)
    {
        $this->model = new TempLmsUser($pdo);
        $this->templatePath = $templatePath;

        $this->smsModel = new SMSModel($_ENV['SMS_AUTH_TOKEN'], $_ENV['SMS_SENDER_ID'], $templatePath);
        $this->emailModel = new EmailModel(
            $_ENV['SMTP_HOST'],
            $_ENV['SMTP_USERNAME'],
            $_ENV['SMTP_PASSWORD'],
            $_ENV['SMTP_FROM_EMAIL'],
            $_ENV['SMTP_FROM_NAME'],
            $templatePath
        );
    }

    // Get count of all users
    public function countUsers()
    {
        $count = $this->model->countUsers();
        echo json_encode(['user_count' => $count]);
    }

    // Get all users
    public function getAllUsers()
    {
        $users = $this->model->getAllUsers();
        echo json_encode($users);
    }

    // Get a user by ID
    public function getUserById($id)
    {
        $user = $this->model->getUserById($id);
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function SendEmailTest()
    {
        $to = "thilinaruwan112@gmail.com";
        $subject = "Test Email from Pharma College";
        $body = "This is a test email sent from the Pharma College application.";
        $altBody = "This is the plain text version of the email content.";

        $result = $this->emailModel->sendGenericEmail($to, $subject, $body, $altBody);
        echo json_encode($result);
    }

    // Create a new user
    // public function createUser()
    // {
    //     // Get the data from the request body
    //     $data = json_decode(file_get_contents("php://input"), true);

    //     try {
    //         // Call the model to insert the new user and get the last inserted ID
    //         $userId = $this->model->createUser($data);

    //         // Return success response with the new user's ID
    //         http_response_code(201); // Created successfully
    //         echo json_encode(['message' => 'User created successfully', 'user_id' => $userId]);
    //     } catch (Exception $e) {
    //         // Handle error
    //         http_response_code(400); // Bad Request
    //         echo json_encode(['error' => 'Failed to create user', 'details' => $e->getMessage()]);
    //     }
    // }


    // Create a new user
    public function createUser()
    {
        // Get the data from the request body
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            // Call the model to insert the new user and get the last inserted ID
            $userId = $this->model->createUser($data);

            // Prepare the welcome message
            $mobile = $data['phone_number']; // Assuming 'phone_number' is the key for the user's mobile number
            $studentName = $data['first_name'] . ' ' . $data['last_name']; // Combine first and last name
            $referenceNumber = $userId; // Use the user ID as the reference number

            // Send the welcome SMS
            $smsResponse = $this->smsModel->sendWelcomeSMS($mobile, $studentName, $referenceNumber);
            $to = "thilinaruwan112@gmail.com";
            $subject = $referenceNumber . " | Account Activation from Pharma College";
            $body = "Account Activation from Pharma College Your reference number is: " . $referenceNumber;
            $altBody = "This is the plain text version of the email content.";

            $result = $this->emailModel->sendGenericEmail($to, $subject, $body, $altBody);

            // Check if the SMS was sent successfully
            if ($smsResponse['status'] === 'error') {
                throw new Exception('Failed to send welcome SMS: ' . $smsResponse['message']);
            }

            // Return success response with the new user's ID
            http_response_code(201); // Created successfully
            echo json_encode([
                'message' => 'User created successfully',
                'user_id' => $userId,
                'sms_status' => $smsResponse['status'],
                'sms_message' => $smsResponse['message']
            ]);
        } catch (Exception $e) {
            // Handle error
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'Failed to create user', 'details' => $e->getMessage()]);
        }
    }

    // Delete a user by ID
    public function deleteUser($id)
    {
        try {
            $this->model->deleteUser($id);
            echo json_encode(['message' => 'User deleted successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to delete user', 'details' => $e->getMessage()]);
        }
    }

    // Get users by approval status
    public function getUsersByApprovalStatus($status)
    {
        $users = $this->model->getUsersByApprovalStatus($status);
        echo json_encode($users);
    }

    // Get users by selected course
    public function getUsersByCourse($course)
    {
        $users = $this->model->getUsersByCourse($course);
        echo json_encode($users);
    }
}
