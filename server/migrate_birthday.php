<?php
// server/migrate_birthday.php
require_once __DIR__ . '/config/database.php';

try {
    echo "Starting birthday system migration...\n";

    // 1. Create birthday_settings table
    $sqlSettings = "CREATE TABLE IF NOT EXISTS `birthday_settings` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `sms_template` text DEFAULT NULL,
        `email_subject` varchar(255) DEFAULT NULL,
        `email_template` text DEFAULT NULL,
        `is_sms_enabled` tinyint(1) DEFAULT 0,
        `is_email_enabled` tinyint(1) DEFAULT 0,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sqlSettings);
    echo "Checked birthday_settings table.\n";

    // Seed default settings if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM `birthday_settings` international_medicine");
    $count = $pdo->query("SELECT COUNT(*) FROM `birthday_settings`")->fetchColumn();
    
    if ($count == 0) {
        $sqlSeed = "INSERT INTO `birthday_settings` 
                    (id, sms_template, email_subject, email_template, is_sms_enabled, is_email_enabled) 
                    VALUES 
                    (1, 'Happy Birthday {{FIRST_NAME}}! We wish you a wonderful day. - Ceylon Pharma College', 
                    'Happy Birthday {{FIRST_NAME}}!', 
                    'Dear {{FULL_NAME}},<br><br>Wishing you a very Happy Birthday! May your day be filled with joy and success.<br><br>Regards,<br>Ceylon Pharma College', 
                    1, 1)";
        $pdo->exec($sqlSeed);
        echo "Inserted default birthday settings.\n";
    }

    // 2. Create birthday_wish_logs table
    $sqlLogs = "CREATE TABLE IF NOT EXISTS `birthday_wish_logs` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `student_id` varchar(50) DEFAULT NULL,
        `student_name` varchar(255) DEFAULT NULL,
        `type` enum('sms','email') NOT NULL,
        `recipient` varchar(255) NOT NULL,
        `status` enum('success','failed') NOT NULL,
        `error_message` text DEFAULT NULL,
        `message_content` text DEFAULT NULL,
        `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`id`),
        KEY `idx_student_id` (`student_id`),
        KEY `idx_sent_at` (`sent_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sqlLogs);
    echo "Checked birthday_wish_logs table.\n";

    echo "\nMigration completed successfully!\n";

} catch (PDOException $e) {
    die("FATAL ERROR during migration: " . $e->getMessage() . "\n");
}
