<?php

require_once './models/BirthdaySettings.php';
require_once './models/BirthdayWishLog.php';
require_once './models/UserFullDetails.php';
require_once './models/SMSModel.php';
require_once './models/EmailModel.php';

class BirthdaySettingsController
{
    private $birthdaySettingsModel;
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->birthdaySettingsModel = new BirthdaySettings($pdo);
    }

    public function getSettings()
    {
        try {
            $settings = $this->birthdaySettingsModel->getSettings();
            echo json_encode(['status' => 'success', 'data' => $settings]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function updateSettings()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
                return;
            }

            $this->birthdaySettingsModel->updateSettings($data);
            echo json_encode(['status' => 'success', 'message' => 'Settings updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function sendTestMessage()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['type']) || !isset($data['recipient'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
                return;
            }

            $type = $data['type'];
            $recipient = trim($data['recipient']);
            
            // Normalize Phone Number (ensure it starts with '0' for Sri Lanka)
            if ($type === 'sms' && !preg_match('/^0/', $recipient) && strlen($recipient) === 9) {
                $recipient = '0' . $recipient;
            }

            $template = $data['template'];
            $subject = $data['subject'] ?? 'Test Birthday Wish';

            // Mock data for placeholders
            $mockData = [
                '{{FIRST_NAME}}' => 'John',
                '{{LAST_NAME}}' => 'Doe',
                '{{FULL_NAME}}' => 'John Doe',
                '{{STUDENT_ID}}' => 'STU12345',
                '{{NAME_WITH_INITIALS}}' => 'J. Doe',
                '{{NIC}}' => '123456789V',
                '{{EMAIL}}' => 'john.doe@example.com'
            ];

            $messageBody = str_replace(array_keys($mockData), array_values($mockData), $template);
            $messageSubject = str_replace(array_keys($mockData), array_values($mockData), $subject);

            if ($type === 'sms') {
                require_once './models/SMSModel.php';
                $authToken = $_ENV['SMS_AUTH_TOKEN'];
                $senderId = $_ENV['SMS_SENDER_ID'];
                $smsModel = new SMSModel($authToken, $senderId, '');
                $result = $smsModel->sendSMS($recipient, $senderId, $messageBody);
            } else if ($type === 'email') {
                require_once './models/EmailModel.php';
                $emailModel = new EmailModel(
                    $_ENV['SMTP_HOST'],
                    $_ENV['SMTP_USERNAME'],
                    $_ENV['SMTP_PASSWORD'],
                    $_ENV['SMTP_FROM_EMAIL'],
                    $_ENV['SMTP_FROM_NAME'],
                    ''
                );
                $resultJson = $emailModel->sendGenericEmail($recipient, $messageSubject, $messageBody);
                $result = json_decode($resultJson, true);
            } else {
                throw new Exception("Invalid message type.");
            }

            if (isset($result['status']) && $result['status'] === 'success') {
                echo json_encode(['status' => 'success', 'message' => 'Test message sent successfully']);
            } else {
                throw new Exception($result['message'] ?? 'Failed to send test message');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getSystemTime()
    {
        try {
            // Anchor both times to UTC first for maximum accuracy
            $utcTime = new DateTime('now', new DateTimeZone('UTC'));
            
            // UK Time (Europe/London)
            $dateUK = clone $utcTime;
            $dateUK->setTimezone(new DateTimeZone('Europe/London'));
            $serverTime = $dateUK->format('Y-m-d H:i:s');
            
            // Sri Lanka Time (Asia/Colombo)
            $dateSL = clone $utcTime;
            $dateSL->setTimezone(new DateTimeZone('Asia/Colombo'));
            $localTime = $dateSL->format('Y-m-d H:i:s');

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'server_time' => $serverTime,
                    'server_timezone' => 'Europe/London',
                    'local_time' => $localTime,
                    'local_timezone' => 'Asia/Colombo'
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getBirthdayList()
    {
        try {
            $dayParam = $_GET['day'] ?? 'today';
            
            // Determine the target date: handle both aliases and literal date strings
            if (in_array($dayParam, ['yesterday', 'today', 'tomorrow'])) {
                $date = new DateTime('now', new DateTimeZone('Asia/Colombo'));
                if ($dayParam === 'yesterday') {
                    $date->modify('-1 day');
                } else if ($dayParam === 'tomorrow') {
                    $date->modify('+1 day');
                }
            } else {
                // Assume it's a date string (e.g. 2026-04-14)
                try {
                    $date = new DateTime($dayParam);
                } catch (Exception $e) {
                    $date = new DateTime('now', new DateTimeZone('Asia/Colombo'));
                }
            }

            $month = $date->format('m');
            $day = $date->format('d');

            $userModel = new UserFullDetails($this->pdo);
            $users = $userModel->getUsersWithBirthdayToday($month, $day);

            echo json_encode(['status' => 'success', 'data' => $users]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function sendManualWish()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['type']) || !isset($data['student_id']) || !isset($data['recipient'])) {
                throw new Exception("Missing required fields.");
            }

            $type = $data['type'];
            $studentId = $data['student_id'];
            $recipient = trim($data['recipient']);
            $studentName = $data['student_name'] ?? 'Student';
            $template = $data['template'];
            $subject = $data['subject'] ?? '';

            // Normalize Phone
            if ($type === 'sms' && !preg_match('/^0/', $recipient) && strlen($recipient) === 9) {
                $recipient = '0' . $recipient;
            }

            $status = 'success';
            $errorMessage = null;
            $result = null;

            if ($type === 'sms') {
                $smsModel = new SMSModel($_ENV['SMS_AUTH_TOKEN'], $_ENV['SMS_SENDER_ID'], '');
                $result = $smsModel->sendSMS($recipient, $_ENV['SMS_SENDER_ID'], $template);
            } else {
                $emailModel = new EmailModel(
                    $_ENV['SMTP_HOST'],
                    $_ENV['SMTP_USERNAME'],
                    $_ENV['SMTP_PASSWORD'],
                    $_ENV['SMTP_FROM_EMAIL'],
                    $_ENV['SMTP_FROM_NAME'],
                    ''
                );
                $resultJson = $emailModel->sendGenericEmail($recipient, $subject, $template);
                $result = json_decode($resultJson, true);
            }

            if (!isset($result['status']) || $result['status'] !== 'success') {
                $status = 'failed';
                $errorMessage = $result['message'] ?? 'Unknown transmission error';
            }

            // Log the attempt
            $logModel = new BirthdayWishLog($this->pdo);
            $logModel->createLog([
                'student_id' => $studentId,
                'student_name' => $studentName,
                'type' => $type,
                'recipient' => $recipient,
                'status' => $status,
                'error_message' => $errorMessage,
                'message_content' => $template
            ]);

            if ($status === 'failed') {
                throw new Exception($errorMessage);
            }

            echo json_encode(['status' => 'success', 'message' => 'Birthday wish sent and logged.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function getHistory()
    {
        try {
            $logModel = new BirthdayWishLog($this->pdo);
            $logs = $logModel->getRecentLogs(50);
            echo json_encode(['status' => 'success', 'data' => $logs]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
