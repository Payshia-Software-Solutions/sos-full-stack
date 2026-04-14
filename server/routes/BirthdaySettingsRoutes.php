<?php

require_once './controllers/BirthdaySettingsController.php';

// Instantiate the controller
$birthdaySettingsController = new BirthdaySettingsController($pdo);

return [
    'GET /birthday-settings/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->getSettings();
    },
    'POST /birthday-settings/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->updateSettings();
    },
    'POST /birthday-settings/send-test/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->sendTestMessage();
    },
    'GET /birthday-settings/system-time/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->getSystemTime();
    }
];
