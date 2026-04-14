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
    },
    'GET /birthday-wishes/list/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->getBirthdayList();
    },
    'POST /birthday-wishes/send-manual/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->sendManualWish();
    },
    'GET /birthday-wishes/history/$' => function () use ($birthdaySettingsController) {
        $birthdaySettingsController->getHistory();
    }
];
