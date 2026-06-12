<?php
$host = '127.0.0.1';
$db   = 'pharmaco_pharmacollege';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;port=3306;dbname=$db;charset=$charset";
$pdo = new PDO($dsn, $user, $pass);
$stmt = $pdo->query("SELECT username FROM user_full_details LIMIT 5");
$users = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "Users: " . implode(", ", $users) . "\n";
