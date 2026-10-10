<?php
require_once '../config/database.php';
try {
    $stmt = $pdo->query("SHOW TABLES LIKE '%batch%'");
    $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($tables);
    
    $stmt = $pdo->query("SELECT * FROM batch_list LIMIT 5");
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($batches);
} catch (Exception $e) {
    echo $e->getMessage();
}
