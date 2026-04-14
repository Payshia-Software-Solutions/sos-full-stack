<?php

// server/cron/send_birthday_wishes.php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/BirthdaySettings.php';
require_once __DIR__ . '/../models/SMSModel.php';
require_once __DIR__ . '/../models/EmailModel.php';

require_once __DIR__ . '/../models/UserFullDetails.php';

date_default_timezone_set('Asia/Colombo');

// Load environment variables if not already loaded
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

// 1. Get Birthday Settings
$birthdaySettingsModel = new BirthdaySettings($pdo);
$settings = $birthdaySettingsModel->getSettings();

if (!$settings) {
    die("Birthday settings not found.\n");
}

if (!$settings['is_sms_enabled'] && !$settings['is_email_enabled']) {
    die("Birthday wishes are disabled in settings.\n");
}

// 2. Find Users with Birthday Today
$userFullDetailsModel = new UserFullDetails($pdo);
$todayMonth = date('m');
$todayDay = date('d');

$users = $userFullDetailsModel->getUsersWithBirthdayToday($todayMonth, $todayDay);

if (empty($users)) {
    echo "No birthdays today.\n";
    exit;
}

echo "Found " . count($users) . " birthday(s) today.\n";

// 3. Initialize Communication Models
$authToken = $_ENV['SMS_AUTH_TOKEN'] ?? '';
$senderId = $_ENV['SMS_SENDER_ID'] ?? 'Pharma C.';

$smsModel = new SMSModel($authToken, $senderId, ''); // Template path not needed for generic send

$emailModel = new EmailModel(
    $_ENV['SMTP_HOST'] ?? '',
    $_ENV['SMTP_USERNAME'] ?? '',
    $_ENV['SMTP_PASSWORD'] ?? '',
    $_ENV['SMTP_FROM_EMAIL'] ?? '',
    $_ENV['SMTP_FROM_NAME'] ?? '',
    '' // Template path not needed
);

foreach ($users as $user) {
    $firstName = $user['first_name'] ?? 'Student';
    $lastName = $user['last_name'] ?? '';
    $fullName = ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '');
    $studentId = $user['student_id'] ?? '';
    $nameWithInitials = $user['name_with_initials'] ?? '';
    $nic = $user['nic'] ?? '';
    $mobile = $user['telephone_1'] ?? $user['telephone_2'] ?? '';
    $email = $user['e_mail'] ?? '';

    $placeholders = ['{{FIRST_NAME}}', '{{LAST_NAME}}', '{{FULL_NAME}}', '{{STUDENT_ID}}', '{{NAME_WITH_INITIALS}}', '{{NIC}}', '{{EMAIL}}'];
    $values = [$firstName, $lastName, $fullName, $studentId, $nameWithInitials, $nic, $email];

    // Process SMS
    if ($settings['is_sms_enabled'] && !empty($mobile)) {
        $smsMessage = str_replace($placeholders, $values, $settings['sms_template']);
        echo "Sending SMS to $mobile ... ";
        $result = $smsModel->sendSMS($mobile, $senderId, $smsMessage);
        echo (isset($result['status']) && $result['status'] == 'success' ? "SUCCESS" : "FAILED") . "\n";
    }

    // Process Email
    if ($settings['is_email_enabled'] && !empty($email)) {
        $emailSubject = str_replace($placeholders, $values, $settings['email_subject']);
        $emailBody = str_replace($placeholders, $values, $settings['email_template']);
        echo "Sending Email to $email ... ";
        $result = $emailModel->sendGenericEmail($email, $emailSubject, $emailBody);
        // sendGenericEmail returns json encoded string or array
        if (is_string($result)) {
            $resultArr = json_decode($result, true);
        } else {
            $resultArr = $result;
        }
        echo (isset($resultArr['status']) && $resultArr['status'] == 'success' ? "SUCCESS" : "FAILED") . "\n";
    }
}

echo "Cron job finished.\n";
