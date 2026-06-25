<?php
require_once __DIR__ . '/../config/database.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM master_product");
    $count = $stmt->fetchColumn();
    echo "Product Count: " . $count . "\n";
    
    if ($count > 0) {
        $stmt = $pdo->query("SELECT product_id, ProductName, product_code FROM master_product LIMIT 5");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        print_r($rows);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
