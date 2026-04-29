<?php
$host = '127.0.0.1';
$db   = 'pharmaco_pharmacollege';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

require_once 'models/Winpharma/WinPharmaSubmission.php';
$model = new WinPharmaSubmission($pdo);
$courseCode = 'CPCC31';
$performance = $model->getGraderPerformance($courseCode);
$stats = $model->getBatchGradingStats($courseCode);

echo "STATS:\n";
print_r($stats);
echo "\nPERFORMANCE (First 2):\n";
print_r(array_slice($performance, 0, 2));

// Check distinct statuses in the table
$stmt = $pdo->query("SELECT DISTINCT grade_status FROM win_pharma_submission");
$statuses = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "\nDISTINCT STATUSES IN DB:\n";
print_r($statuses);
