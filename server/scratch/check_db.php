<?php
require_once 'config/database.php';
echo "Tables:\n";
$stmt = $pdo->query('SHOW TABLES');
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

echo "\nColumns for medi_mind_levels:\n";
$stmt = $pdo->query('DESCRIBE medi_mind_levels');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\nColumns for medi_mind_level_mediciens:\n";
$stmt = $pdo->query('DESCRIBE medi_mind_level_mediciens');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\nColumns for medi_mind_level_questions:\n";
$stmt = $pdo->query('DESCRIBE medi_mind_level_questions');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
