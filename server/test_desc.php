<?php
require_once __DIR__ . '/config/Database.php';
try { 
    $stmt = $pdo->query("DESCRIBE pharma_reader_course_assignments"); 
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC)); 
} catch(Exception $e) { 
    echo $e->getMessage(); 
}
