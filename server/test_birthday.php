<?php
require_once 'config/database.php';
require_once 'models/UserFullDetails.php';

header('Content-Type: application/json');

try {
    $date = new DateTime('now', new DateTimeZone('Asia/Colombo'));
    $month = $date->format('m');
    $day = $date->format('d');
    
    echo "Current Date (SL): " . $date->format('Y-m-d H:i:s') . "\n";
    echo "Searching for month: $month, day: $day\n\n";

    $userModel = new UserFullDetails($pdo);
    $users = $userModel->getUsersWithBirthdayToday($month, $day);

    echo "Found " . count($users) . " students:\n";
    foreach ($users as $u) {
        echo "- " . $u['first_name'] . " " . $u['last_name'] . " (" . $u['birth_day'] . ")\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
