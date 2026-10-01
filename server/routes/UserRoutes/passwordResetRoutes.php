<?php
// routes/UserRoutes/passwordResetRoutes.php

require_once './controllers/PasswordResetController.php';

$pdo = $GLOBALS['pdo'];
$authToken = $GLOBALS['authToken'] ?? $_ENV['SMS_AUTH_TOKEN'] ?? '';
$senderId = $GLOBALS['senderId'] ?? $_ENV['SMS_SENDER_ID'] ?? 'Pharma C.';
$templatePath = $GLOBALS['templatePath'] ?? (__DIR__ . '/../../templates/welcome_sms_template.txt');

$passwordResetController = new PasswordResetController($pdo, $authToken, $senderId, $templatePath);

return [
    'POST /password-reset/request-otp' => [$passwordResetController, 'requestOtp'],
    'POST /password-reset/verify-otp' => [$passwordResetController, 'verifyOtp'],
    'POST /password-reset/reset' => [$passwordResetController, 'resetPassword'],
    'POST /password-reset/admin-reset' => [$passwordResetController, 'adminResetPassword'],
    'POST /password-reset/validate-token' => [$passwordResetController, 'validateToken'],
    'GET /password-reset/validate-token' => [$passwordResetController, 'validateToken'],

    // User auth aliases
    'POST /users/forgot-password' => [$passwordResetController, 'requestOtp'],
    'POST /users/verify-otp' => [$passwordResetController, 'verifyOtp'],
    'POST /users/reset-password' => [$passwordResetController, 'resetPassword'],
];
