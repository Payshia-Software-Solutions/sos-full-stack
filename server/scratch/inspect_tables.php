<?php
$host = '127.0.0.1';
$db   = 'pharmaco_pharmacollege';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;port=3306;dbname=$db;charset=$charset";
$pdo = new PDO($dsn, $user, $pass);

// Check all tables in the entire database
$stmt = $pdo->query("SHOW TABLES");
$allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

$matches = [];
foreach ($allTables as $t) {
    if (preg_match('/(issue|reason|help|desk|service|type|topic|query)/i', $t)) {
        $matches[] = $t;
    }
}

echo "--- MATCHING TABLES (issue, reason, service, topic, etc.) ---\n";
print_r($matches);

// Also describe support_ticket structure to see what fields it uses!
echo "--- SUPPORT_TICKET COLUMNS ---\n";
$stmt2 = $pdo->query("DESCRIBE support_ticket");
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
