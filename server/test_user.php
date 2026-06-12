<?php
$host = '127.0.0.1';
$db   = 'pharmaco_pharmacollege';
$user = 'root';
$pass = '';
$dsn = "mysql:host=$host;port=3306;dbname=$db";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $stmt = $pdo->prepare("SELECT * FROM user_full_details WHERE username = 'PA30001'");
    $stmt->execute();
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Result: " . json_encode($res);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
