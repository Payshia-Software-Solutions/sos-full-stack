<?php

require_once './models/Users/TempLmsUser.php';
require_once './models/Users/User.php';
require_once './models/UserFullDetails.php';
require_once './helpers/LmsHelper.php';
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

            // Send the registration SMS
            $smsResponse = $this->smsModel->sendRegistrationSMS($mobile, $studentName, $referenceNumber);
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
            
            $errorMessage = 'Failed to create user';
            $details = $e->getMessage();
            
            // Handle duplicate entry exceptions
            if (strpos($details, '1062 Duplicate entry') !== false) {
                if (strpos($details, 'email_address') !== false) {
                    $errorMessage = 'This email address is already registered. If you have already registered, please wait for admin approval.';
                } else if (strpos($details, 'nic_number') !== false) {
                    $errorMessage = 'This NIC number is already registered. If you have already registered, please wait for admin approval.';
                } else {
                    $errorMessage = 'You have already registered with these details. Please wait for admin approval.';
                }
            }
            
            echo json_encode(['error' => $errorMessage, 'details' => $details]);
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
        $status = str_replace('_', ' ', $status);
        
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $startDate = isset($_GET['start_date']) && $_GET['start_date'] !== '' ? $_GET['start_date'] : null;
        $endDate = isset($_GET['end_date']) && $_GET['end_date'] !== '' ? $_GET['end_date'] : null;
        $offset = ($page - 1) * $limit;

        $result = $this->model->getUsersByApprovalStatus($status, $limit, $offset, $search, $startDate, $endDate);
        echo json_encode($result);
    }

    // Get users by selected course
    public function getUsersByCourse($course)
    {
        $users = $this->model->getUsersByCourse($course);
        echo json_encode($users);
    }

    // Activate temporary user
    public function activateUser($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $studentBatch = $data['studentBatch'] ?? null;
        $activatedBy = $data['activatedBy'] ?? 'Admin';

        if (!$studentBatch) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing studentBatch']);
            return;
        }

        try {
            $GLOBALS['pdo']->beginTransaction();

            $tempUser = $this->model->getUserById($id);
            if (!$tempUser) {
                throw new Exception("Temporary user not found.");
            }

            if ($tempUser['aprroved_status'] === 'Approved') {
                throw new Exception("This registration has already been approved and activated.");
            }

            // Check if there is already an approved user with the same email in the temp_lms_user table
            $checkEmailStmt = $GLOBALS['pdo']->prepare("SELECT index_number FROM temp_lms_user WHERE email_address = ? AND aprroved_status = 'Approved' AND id != ? LIMIT 1");
            $checkEmailStmt->execute([$tempUser['email_address'], $id]);
            $existingIndex = $checkEmailStmt->fetchColumn();
            if ($existingIndex) {
                throw new Exception("This email address ({$tempUser['email_address']}) is already associated with an approved and active student account (Index Number: {$existingIndex}).");
            }

            // Check if there is already an approved user with the same NIC in the temp_lms_user table
            if (!empty($tempUser['nic_number'])) {
                $checkNicStmt = $GLOBALS['pdo']->prepare("SELECT index_number FROM temp_lms_user WHERE nic_number = ? AND aprroved_status = 'Approved' AND id != ? LIMIT 1");
                $checkNicStmt->execute([$tempUser['nic_number'], $id]);
                $existingIndex = $checkNicStmt->fetchColumn();
                if ($existingIndex) {
                    throw new Exception("This NIC number ({$tempUser['nic_number']}) is already associated with an approved and active student account (Index Number: {$existingIndex}).");
                }
            }

            // Generate Index
            $indexData = LmsHelper::GenerateLmsIndexNumber($GLOBALS['pdo'], $studentBatch);
            $userName = $indexData['userName'];
            $userId = $indexData['userId'];

            // Update Temp User first to ensure no duplicate inserts can happen if it throws a constraint violation (since MyISAM does not support rollbacks)
            $tempUser['aprroved_status'] = 'Approved';
            $tempUser['index_number'] = $userName;
            $this->model->updateUser($id, $tempUser);

            // Determine status_id (title)
            $statusId = 'Mr.';
            if (stripos($tempUser['civil_status'], 'Rev') !== false) {
                $statusId = 'Rev.';
            } elseif (stripos($tempUser['gender'], 'Female') !== false || stripos($tempUser['gender'], 'F') !== false) {
                if (stripos($tempUser['civil_status'], 'Married') !== false && stripos($tempUser['civil_status'], 'Unmarried') === false) {
                    $statusId = 'Mrs.';
                } else {
                    $statusId = 'Miss.';
                }
            }

            // Format phone number
            $formattedPhone = str_pad($tempUser['phone_number'], 10, '0', STR_PAD_LEFT);
            $batchNum = preg_replace('/\D/', '', $studentBatch);

            // Generate Temporary Password
            $tempPassword = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5);

            // Base User Account
            $userModel = new SysUser($GLOBALS['pdo']);
            $userModel->createRecord([
                'status_id' => $statusId,
                'userid' => $userId,
                'fname' => $tempUser['first_name'],
                'lname' => $tempUser['last_name'],
                'batch_id' => sprintf('%02d', $batchNum),
                'username' => $userName,
                'phone' => $formattedPhone,
                'email' => $tempUser['email_address'],
                'password' => password_hash($tempPassword, PASSWORD_DEFAULT), 
                'userlevel' => 'Student',
                'status' => 'Active',
                'created_by' => 'System',
                'created_at' => date('Y-m-d H:i:s'),
                'batch_lock' => 'Active',
                'temp_password' => $tempPassword
            ]);

            // User Full Details
            $fullDetailsModel = new UserFullDetails($GLOBALS['pdo']);
            $fullDetailsModel->createUser([
                'student_id' => $userId,
                'username' => $userName,
                'civil_status' => $tempUser['civil_status'],
                'first_name' => $tempUser['first_name'],
                'last_name' => $tempUser['last_name'],
                'gender' => $tempUser['gender'],
                'address_line_1' => $tempUser['address_l1'],
                'address_line_2' => $tempUser['address_l2'],
                'city' => $tempUser['city'],
                'district' => $tempUser['district'],
                'postal_code' => $tempUser['postal_code'],
                'telephone_1' => $formattedPhone,
                'telephone_2' => str_pad($tempUser['whatsapp_number'], 10, '0', STR_PAD_LEFT),
                'nic' => $tempUser['nic_number'],
                'e_mail' => $tempUser['email_address'],
                'birth_day' => null, 
                'updated_by' => 'System',
                'updated_at' => date('Y-m-d H:i:s'),
                'full_name' => $tempUser['full_name'],
                'name_with_initials' => $tempUser['name_with_initials'],
                'name_on_certificate' => $tempUser['name_on_certificate']
            ]);

            // Enroll Student
            $enrollStmt = $GLOBALS['pdo']->prepare("INSERT INTO student_course (course_code, student_id, enrollment_key) VALUES (?, ?, ?)");
            $enrollStmt->execute([$studentBatch, $userId, 'ForceAdmin']);

            // Record activation details
            $lkTimezone = new DateTimeZone('Asia/Colombo');
            $lkTime = new DateTime('now', $lkTimezone);
            $activatedAt = $lkTime->format('Y-m-d H:i:s');
            $this->model->recordActivation($id, $activatedBy, $activatedAt);

            // Get Course Name
            $courseStmt = $GLOBALS['pdo']->prepare("SELECT course_name FROM course WHERE course_code = ?");
            $courseStmt->execute([$studentBatch]);
            $courseInfo = $courseStmt->fetch(PDO::FETCH_ASSOC);
            $courseName = $courseInfo ? $courseInfo['course_name'] : $studentBatch;

            // Send SMS
            $smsResponse = $this->smsModel->sendWelcomeSMS($tempUser['phone_number'], $tempUser['first_name'], $userName, $tempPassword, $courseName);

            $GLOBALS['pdo']->commit();

            echo json_encode([
                'message' => 'User activated successfully',
                'username' => $userName,
                'sms_status' => $smsResponse
            ]);

        } catch (Exception $e) {
            if ($GLOBALS['pdo']->inTransaction()) {
                $GLOBALS['pdo']->rollBack();
            }
            http_response_code(400);
            echo json_encode(['error' => 'Activation failed', 'details' => $e->getMessage()]);
        }
    }

    // Reverse activation
    public function reverseActivation($id)
    {
        try {
            $GLOBALS['pdo']->beginTransaction();

            $tempUser = $this->model->getUserById($id);
            if (!$tempUser) {
                throw new Exception("Temporary user not found.");
            }

            if ($tempUser['aprroved_status'] !== 'Approved') {
                throw new Exception("User is not approved yet.");
            }

            $userName = $tempUser['index_number'];
            if (!$userName) {
                throw new Exception("No index number found for the user.");
            }

            // Find the user full details to get the student_id (like PA/33/001)
            $fullDetailsStmt = $GLOBALS['pdo']->prepare("SELECT student_id FROM user_full_details WHERE username = ?");
            $fullDetailsStmt->execute([$userName]);
            $fullDetailsInfo = $fullDetailsStmt->fetch(PDO::FETCH_ASSOC);
            $studentId = $fullDetailsInfo ? $fullDetailsInfo['student_id'] : null;

            // Delete from student_course
            if ($studentId) {
                $delCourseStmt = $GLOBALS['pdo']->prepare("DELETE FROM student_course WHERE student_id = ?");
                $delCourseStmt->execute([$studentId]);
            }

            // Delete from user_full_details
            $delFullStmt = $GLOBALS['pdo']->prepare("DELETE FROM user_full_details WHERE username = ?");
            $delFullStmt->execute([$userName]);

            // Delete from users
            $delUserStmt = $GLOBALS['pdo']->prepare("DELETE FROM users WHERE username = ?");
            $delUserStmt->execute([$userName]);

            // Revert temp user
            $tempUser['aprroved_status'] = 'Not Approved';
            $tempUser['index_number'] = null;
            $this->model->updateUser($id, $tempUser);

            $GLOBALS['pdo']->commit();

            echo json_encode([
                'message' => 'Activation reversed successfully'
            ]);
        } catch (Exception $e) {
            if ($GLOBALS['pdo']->inTransaction()) {
                $GLOBALS['pdo']->rollBack();
            }
            http_response_code(400);
            echo json_encode(['error' => 'Reverse activation failed', 'details' => $e->getMessage()]);
        }
    }

    // Update temporary user details
    public function updateUser($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $updated = $this->model->updateUserDetails($id, $data);
            if ($updated) {
                echo json_encode(['message' => 'User updated successfully']);
            } else {
                echo json_encode(['message' => 'No changes made or user not found']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to update user', 'details' => $e->getMessage()]);
        }
    }

    // Reject temporary user
    public function rejectUser($id)
    {
        try {
            $updated = $this->model->rejectUser($id);
            if ($updated) {
                echo json_encode(['message' => 'User rejected successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to reject user', 'details' => $e->getMessage()]);
        }
    }
    // Resend Activation SMS
    public function resendActivationSMS($id)
    {
        try {
            $tempUser = $this->model->getUserById($id);

            if (!$tempUser) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            if ($tempUser['aprroved_status'] !== 'Approved') {
                http_response_code(400);
                echo json_encode(['error' => 'User is not activated yet']);
                return;
            }

            // Send SMS
            // Get Course Name
            $courseStmt = $GLOBALS['pdo']->prepare("SELECT course_name FROM course WHERE course_code = ?");
            $courseStmt->execute([$tempUser['selected_course']]);
            $courseInfo = $courseStmt->fetch(PDO::FETCH_ASSOC);
            $courseName = $courseInfo ? $courseInfo['course_name'] : $tempUser['selected_course'];

            // Get Temp Password
            $userStmt = $GLOBALS['pdo']->prepare("SELECT temp_password FROM users WHERE username = ?");
            $userStmt->execute([$tempUser['index_number']]);
            $userInfo = $userStmt->fetch(PDO::FETCH_ASSOC);
            $tempPassword = $userInfo && $userInfo['temp_password'] ? $userInfo['temp_password'] : '';

            $smsResponse = $this->smsModel->sendWelcomeSMS($tempUser['phone_number'], $tempUser['first_name'], $tempUser['index_number'], $tempPassword, $courseName);

            echo json_encode([
                'message' => 'SMS resent successfully',
                'sms_status' => $smsResponse
            ]);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to resend SMS', 'details' => $e->getMessage()]);
        }
    }
}
