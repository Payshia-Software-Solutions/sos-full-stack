<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Table count: " . count($tables) . "\n";
    foreach(['dpad_course_prescriptions', 'migrations', 'pharma_reader_batch_settings', 'pharma_reader_course_assignments', 'sms_templates'] as $t) {
        echo $t . ": " . (in_array($t, $tables) ? "Exists" : "Missing") . "\n";
    }
} catch(Exception $e) {
    echo $e->getMessage();
}
