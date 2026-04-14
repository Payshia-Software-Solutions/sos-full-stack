<?php

require_once './models/BirthdaySettings.php';

class BirthdaySettingsController
{
    private $birthdaySettingsModel;

    public function __construct($pdo)
    {
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
            $serverTimezone = date_default_timezone_get();
            $serverTime = date('Y-m-d H:i:s');
            
            $colomboTimezone = new DateTimeZone('Asia/Colombo');
            $date = new DateTime('now', $colomboTimezone);
            $localTime = $date->format('Y-m-d H:i:s');

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'server_time' => $serverTime,
                    'server_timezone' => $serverTimezone,
                    'local_time' => $localTime,
                    'local_timezone' => 'Asia/Colombo'
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
