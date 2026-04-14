<?php

// server/cron/send_birthday_wishes.php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/BirthdaySettings.php';
require_once __DIR__ . '/../models/SMSModel.php';
require_once __DIR__ . '/../models/EmailModel.php';

require_once __DIR__ . '/../models/UserFullDetails.php';

date_default_timezone_set('Asia/Colombo');

/**
 * Helper function to log messages with timestamps
 */
function logMessage($message, $isError = false) {
    $timestamp = date('Y-m-d H:i:s');
    $level = $isError ? '[ERROR]' : '[INFO]';
    echo "$timestamp $level $message\n";
}

try {
    logMessage("Starting birthday wishes cron job...");

    // Load environment variables if not already loaded
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->safeLoad();

    // 1. Get Birthday Settings
    $birthdaySettingsModel = new BirthdaySettings($pdo);
    $settings = $birthdaySettingsModel->getSettings();

    if (!$settings) {
        throw new Exception("Birthday settings not found in database.");
    }

    if (!$settings['is_sms_enabled'] && !$settings['is_email_enabled']) {
        logMessage("Birthday wishes are disabled in settings. Exiting.");
        exit;
    }

    // 2. Find Users with Birthday Today
    $userFullDetailsModel = new UserFullDetails($pdo);
    $todayMonth = date('m');
    $todayDay = date('d');

    $users = $userFullDetailsModel->getUsersWithBirthdayToday($todayMonth, $todayDay);

    if (empty($users)) {
        logMessage("No birthdays found for today ($todayMonth-$todayDay).");
        exit;
    }

    logMessage("Found " . count($users) . " birthday(s) today.");

    // 3. Initialize Communication Models
    $authToken = $_ENV['SMS_AUTH_TOKEN'] ?? '';
    $senderId = $_ENV['SMS_SENDER_ID'] ?? 'Pharma C.';

    $smsModel = new SMSModel($authToken, $senderId, ''); 

    $emailModel = new EmailModel(
        $_ENV['SMTP_HOST'] ?? '',
        $_ENV['SMTP_USERNAME'] ?? '',
        $_ENV['SMTP_PASSWORD'] ?? '',
        $_ENV['SMTP_FROM_EMAIL'] ?? '',
        $_ENV['SMTP_FROM_NAME'] ?? '',
        ''
    );

    foreach ($users as $user) {
        $firstName = $user['first_name'] ?? 'Student';
        $lastName = $user['last_name'] ?? '';
        $fullName = ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '');
        $studentId = $user['student_id'] ?? '';
        $nameWithInitials = $user['name_with_initials'] ?? '';
        $nic = $user['nic'] ?? '';
        $mobile = trim($user['telephone_1'] ?? $user['telephone_2'] ?? '');
        $email = $user['e_mail'] ?? '';

        // Normalize Phone Number (ensure it starts with '0')
        if (!empty($mobile) && !preg_match('/^0/', $mobile) && strlen($mobile) === 9) {
            $mobile = '0' . $mobile;
        }

        $placeholders = ['{{FIRST_NAME}}', '{{LAST_NAME}}', '{{FULL_NAME}}', '{{STUDENT_ID}}', '{{NAME_WITH_INITIALS}}', '{{NIC}}', '{{EMAIL}}'];
        $values = [$firstName, $lastName, $fullName, $studentId, $nameWithInitials, $nic, $email];

        // Process SMS
        if ($settings['is_sms_enabled'] && !empty($mobile)) {
            $smsMessage = str_replace($placeholders, $values, $settings['sms_template']);
            logMessage("Sending SMS to $mobile (Student ID: $studentId)...");
            $result = $smsModel->sendSMS($mobile, $senderId, $smsMessage);
            if (isset($result['status']) && $result['status'] == 'success') {
                logMessage("SMS sent successfully.");
            } else {
                logMessage("SMS FAILED: " . ($result['message'] ?? 'Unknown error'), true);
            }
        }

        // Process Email
        if ($settings['is_email_enabled'] && !empty($email)) {
            $emailSubject = str_replace($placeholders, $values, $settings['email_subject']);
            $emailBody = str_replace($placeholders, $values, $settings['email_template']);
            logMessage("Sending Email to $email (Student ID: $studentId)...");
            $result = $emailModel->sendGenericEmail($email, $emailSubject, $emailBody);
            
            if (is_string($result)) {
                $resultArr = json_decode($result, true);
            } else {
                $resultArr = $result;
            }

            if (isset($resultArr['status']) && $resultArr['status'] == 'success') {
                logMessage("Email sent successfully.");
            } else {
                logMessage("Email FAILED: " . ($resultArr['message'] ?? 'Unknown error'), true);
            }
        }
    }

    logMessage("Cron job finished successfully.");

} catch (Exception $e) {
    logMessage("FATAL ERROR: " . $e->getMessage(), true);
    exit(1);
}
