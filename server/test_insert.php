<?php
require 'c:/xampp/htdocs/sos-full-stack/server/config/Database.php'; 
$db = new Database(); 
$pdo = $db->connect(); 
try { 
    $stmt = $pdo->prepare("INSERT INTO pharma_reader_course_assignments (prescription_id, course_code, assigned_by) VALUES (1, 'test', 'test') ON DUPLICATE KEY UPDATE assigned_by = 'test'"); 
    $stmt->execute(); 
    echo 'Success'; 
} catch(Exception $e) { 
    echo $e->getMessage(); 
}
