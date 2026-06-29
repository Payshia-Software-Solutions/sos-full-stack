<?php
require_once __DIR__ . '/server/config/database.php';
$stmt = $pdo->query("SELECT DISTINCT difficulty FROM reader_medicine");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Difficulties in reader_medicine: \n";
print_r($rows);
