<?php
// Override host for CLI
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

$stmt = $pdo->query("SELECT id, level_name FROM medi_mind_levels");
$levels = $stmt->fetchAll();
echo "Levels:\n";
print_r($levels);

$stmt = $pdo->query("SELECT level_id, COUNT(*) as count FROM medi_mind_level_questions GROUP BY level_id");
$counts = $stmt->fetchAll();
echo "\nQuestion Counts per Level ID:\n";
print_r($counts);
