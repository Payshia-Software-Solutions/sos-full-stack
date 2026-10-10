<?php
require_once './config/database.php';

try {
    echo "Adding index on payment_requests.unique_number...\n";
    $pdo->exec("CREATE INDEX idx_unique_number ON payment_requests (unique_number(50))");
    echo "Done.\n";
} catch (Exception $e) {
    echo "Error or index already exists: " . $e->getMessage() . "\n";
}

try {
    echo "Adding index on payment_requests.hash_value...\n";
    $pdo->exec("CREATE INDEX idx_hash_value ON payment_requests (hash_value(100))");
    echo "Done.\n";
} catch (Exception $e) {
    echo "Error or index already exists: " . $e->getMessage() . "\n";
}

try {
    echo "Adding index on temp_lms_user.aprroved_status...\n";
    $pdo->exec("CREATE INDEX idx_approved_status ON temp_lms_user (aprroved_status(20))");
    echo "Done.\n";
} catch (Exception $e) {
    echo "Error or index already exists: " . $e->getMessage() . "\n";
}

echo "All indexes applied successfully!\n";
