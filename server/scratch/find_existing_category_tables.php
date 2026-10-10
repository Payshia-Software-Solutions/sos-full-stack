<?php
$host = '127.0.0.1';
$db   = 'pharmaco_pharmacollege';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;port=3306;dbname=$db;charset=$charset";
$pdo = new PDO($dsn, $user, $pass);

// Search for any tables with 'categor' or 'ticket' or 'department'
$stmt = $pdo->query("SHOW TABLES LIKE '%categor%'");
$catTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

$stmt2 = $pdo->query("SHOW TABLES LIKE '%ticket%'");
$ticketTables = $stmt2->fetchAll(PDO::FETCH_COLUMN);

$stmt3 = $pdo->query("SHOW TABLES LIKE '%dept%'");
$deptTables = $stmt3->fetchAll(PDO::FETCH_COLUMN);

$stmt4 = $pdo->query("SHOW TABLES LIKE '%department%'");
$departmentTables = $stmt4->fetchAll(PDO::FETCH_COLUMN);

echo "--- CATEGORY TABLES ---\n";
print_r($catTables);

echo "--- TICKET TABLES ---\n";
print_r($ticketTables);

echo "--- DEPT / DEPARTMENT TABLES ---\n";
print_r(array_merge($deptTables, $departmentTables));

// Also let's check tables with 'support'
$stmt5 = $pdo->query("SHOW TABLES LIKE '%support%'");
$supportTables = $stmt5->fetchAll(PDO::FETCH_COLUMN);
echo "--- SUPPORT TABLES ---\n";
print_r($supportTables);
