<?php
try {
    require 'config/database.php';
    $pdo = $GLOBALS['pdo'];
    
    echo "Checking win_pharma_submission:\n";
    $stmt = $pdo->query("DESCRIBE win_pharma_submission");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    echo "\nChecking commision_setup:\n";
    $stmt = $pdo->query("DESCRIBE commision_setup");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    echo "\nChecking users:\n";
    $stmt = $pdo->query("DESCRIBE users");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
