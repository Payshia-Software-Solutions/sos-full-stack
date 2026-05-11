<?php
require_once 'config/database.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS medi_mind_course_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_code VARCHAR(255) NOT NULL,
        level_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by VARCHAR(255),
        UNIQUE KEY unique_course_level (course_code, level_id)
    )";

    $pdo->exec($sql);
    echo "Table 'medi_mind_course_levels' created successfully.\n";

} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
