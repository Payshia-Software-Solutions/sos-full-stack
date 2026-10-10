<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $tables = ['dpad_course_prescriptions', 'migrations', 'pharma_reader_batch_settings', 'pharma_reader_course_assignments', 'sms_templates'];
    foreach($tables as $t) {
        $stmt = $pdo->query("SHOW CREATE TABLE $t");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo $row['Create Table'] . ";\n\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
