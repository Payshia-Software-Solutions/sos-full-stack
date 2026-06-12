<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$dsn = "mysql:host=$host;port=3306";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $stmt = $pdo->query("SHOW DATABASES");
    $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Databases: " . implode(", ", $dbs) . "\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
