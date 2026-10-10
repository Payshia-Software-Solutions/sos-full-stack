<?php
require_once __DIR__ . '/config/database.php';

try {
    // Check if column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM `users` LIKE 'verification_status'");
    $col = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$col) {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `verification_status` ENUM('Unverified', 'Pending', 'Verified', 'Rejected') NOT NULL DEFAULT 'Unverified' AFTER `userlevel`");
        echo "Column `verification_status` added to `users` table successfully.\n";
    } else {
        echo "Column `verification_status` already exists in `users` table.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
