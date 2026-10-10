<?php
require_once __DIR__ . '/../config/database.php';

try {
    $sqlFile = __DIR__ . '/master_products_inserts.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found at " . $sqlFile);
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split statements by semicolon or execute them
    // Note: Since these are INSERT statements, let's run them.
    // In our file we see INSERT INTO `master_product` VALUES (...), (...); etc.
    // Let's run it directly.
    echo "Importing products...\n";
    
    // Disable foreign key checks if any, truncate first to avoid duplicate primary keys or starts
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE master_product;");
    
    $result = $pdo->exec($sql);
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM master_product");
    $count = $stmt->fetchColumn();
    
    echo "Successfully imported! Total products count in table: " . $count . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
