<?php
// controllers/PasswordResetController.php

require_once './models/PasswordResetModel.php';
require_once './models/SMSModel.php';

class PasswordResetController
{
    private $model;
    private $smsModel;
    private $senderId;

    public function __construct($pdo, $authToken, $senderId, $templatePath)
    {
        $this->model = new PasswordResetModel($pdo);
        $this->senderId = $senderId ?? 'Pharma C.';
        $this->smsModel = new SMSModel($authToken, $senderId, $templatePath);
    }

    /**
     * POST /password-reset/request-otp
     * Input: { "identifier": "PA12345" or "0712345678" or "email@example.com" }
     */
    public function requestOtp()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $identifier = $input['identifier'] ?? '';

        if (empty(trim($identifier))) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Please enter your Student ID (Username), Mobile Number, or Email address.'
            ]);
            return;
        }

        $user = $this->model->findUserByIdentifier($identifier);

        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'No active student account found for the provided information.'
            ]);
            return;
        }

        $phone = PasswordResetModel::normalizePhone($user['phone'] ?? '');

        if (empty($phone) || !preg_match('/^0\d{9}$/', $phone)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'No valid mobile phone number is registered for this account. Please contact student support for assistance.'
            ]);
            return;
        }

        // Generate 6-digit OTP and 16-character secure token
        $otp = (string)random_int(100000, 999999);
        $token = bin2hex(random_bytes(8)); // 16 characters

        $saved = $this->model->createResetToken(
            $user['username'],
            $user['email'] ?? '',
            $otp,
            $token
        );

        if (!$saved) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to initialize password reset. Please try again later.'
            ]);
            return;
        }

        // Dispatch SMS via SendLK
        $smsMessage = "Your Ceylon Pharma College password reset OTP is: {$otp}. This code is valid for 10 minutes.";
        $smsResponse = $this->smsModel->sendSMS($phone, $this->senderId, $smsMessage);

        echo json_encode([
            'status' => 'success',
            'message' => 'A verification code has been sent to your registered mobile number.',
            'student_number' => $user['username'],
            'masked_phone' => PasswordResetModel::maskPhone($phone),
            'sms_status' => $smsResponse['status'] ?? 'sent'
        ]);
    }

    /**
     * POST /password-reset/verify-otp
     * Input: { "student_number": "PA12345", "otp": "123456" }
     */
    public function verifyOtp()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $studentNumber = trim($input['student_number'] ?? $input['identifier'] ?? '');
        $otp = trim($input['otp'] ?? '');

        if (empty($studentNumber) || empty($otp)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Student ID and 6-digit OTP code are required.'
            ]);
            return;
        }

        // If identifier was phone/email instead of student_number, resolve it
        $user = $this->model->findUserByIdentifier($studentNumber);
        $resolvedStudentNumber = $user ? $user['username'] : $studentNumber;

        $record = $this->model->getActiveOtp($resolvedStudentNumber);

        if (!$record) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'The verification code has expired or does not exist. Please request a new code.'
            ]);
            return;
        }

        if ((string)$record['otp'] !== (string)$otp) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid verification code. Please check the SMS and try again.'
            ]);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Verification successful.',
            'token' => $record['token'],
            'student_number' => $record['student_number']
        ]);
    }

    /**
     * POST /password-reset/reset
     * Input: { "token": "abc123def456...", "new_password": "..." }
     */
    public function resetPassword()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = trim($input['token'] ?? '');
        $newPassword = trim($input['new_password'] ?? $input['password'] ?? '');

        if (empty($token)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Password reset token is missing.'
            ]);
            return;
        }

        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Password must be at least 6 characters long.'
            ]);
            return;
        }

        $record = $this->model->getActiveToken($token);

        if (!$record) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Password reset session has expired or is invalid. Please request a new OTP.'
            ]);
            return;
        }

        // Hash password securely with PHP password_hash
        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);

        // Update user's password
        $updated = $this->model->updateUserPassword($record['student_number'], $hashed);

        if (!$updated) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update password. Please try again.'
            ]);
            return;
        }

        // Invalidate token
        $this->model->invalidateToken($record['id']);

        // Optional confirmation SMS
        $user = $this->model->findUserByIdentifier($record['student_number']);
        if ($user && !empty($user['phone'])) {
            $phone = PasswordResetModel::normalizePhone($user['phone']);
            if (preg_match('/^0\d{9}$/', $phone)) {
                $confirmMsg = "Your Ceylon Pharma College password has been reset successfully. If you did not make this change, please contact support immediately.";
                try {
                    $this->smsModel->sendSMS($phone, $this->senderId, $confirmMsg);
                } catch (Exception $e) {
                    // Suppress SMS confirmation errors so reset succeeds
                    error_log("Failed to send reset confirmation SMS: " . $e->getMessage());
                }
            }
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Your password has been reset successfully. You can now log in with your new password.'
        ]);
    }

    /**
     * POST or GET /password-reset/validate-token
     */
    public function validateToken()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = trim($input['token'] ?? $_GET['token'] ?? '');

        if (empty($token)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'valid' => false, 'message' => 'Token is required.']);
            return;
        }

        $record = $this->model->getActiveToken($token);

        if (!$record) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'valid' => false,
                'message' => 'Password reset link has expired or is invalid.'
            ]);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'valid' => true,
            'student_number' => $record['student_number']
        ]);
    }

    /**
     * POST /password-reset/admin-reset
     * Input: { "student_number": "PA12345", "new_password": "..." }
     */
    public function adminResetPassword()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $studentNumber = trim($input['student_number'] ?? '');
        $newPassword = trim($input['new_password'] ?? '');

        if (empty($studentNumber) || strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Valid student number and password (at least 6 characters) are required.'
            ]);
            return;
        }

        $user = $this->model->findUserByIdentifier($studentNumber);
        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Student account not found.'
            ]);
            return;
        }

        $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $updated = $this->model->updateUserPassword($user['username'], $hashed);

        if (!$updated) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update student password.'
            ]);
            return;
        }

        // Send SMS notification to student if phone exists
        if (!empty($user['phone'])) {
            $phone = PasswordResetModel::normalizePhone($user['phone']);
            if (preg_match('/^0\d{9}$/', $phone)) {
                $smsMsg = "Your Ceylon Pharma College password has been reset by an administrator. Please log in with your new credentials.";
                try {
                    $this->smsModel->sendSMS($phone, $this->senderId, $smsMsg);
                } catch (Exception $e) {}
            }
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Student password has been reset successfully.'
        ]);
    }
}
