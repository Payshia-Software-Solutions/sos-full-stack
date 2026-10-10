<?php
require_once __DIR__ . '/config/database.php';

try {
    $sql = file_get_contents(__DIR__ . '/migrations/create_student_document_verifications_table.sql');
    $pdo->exec($sql);
    echo "Migration completed successfully! Table `student_document_verifications` is ready.\n";
} catch (\PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
