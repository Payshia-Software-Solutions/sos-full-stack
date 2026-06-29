<?php
/**
 * Migration: Create dpad_course_prescriptions junction table
 * Run once: php migrate_dpad_course_assignments.php
 */

require_once './config/database.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS `dpad_course_prescriptions` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `course_code` VARCHAR(255) NOT NULL,
        `prescription_id` VARCHAR(50) NOT NULL,
        `assigned_by` VARCHAR(255) DEFAULT NULL,
        `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `unique_course_pres` (`course_code`, `prescription_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "✅ Table 'dpad_course_prescriptions' created successfully.\n";
} catch (PDOException $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
}
