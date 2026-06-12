<?php

$host = '91.204.209.19';
$db   = 'pharmaco_pharmacollege';
$user = 'pharmaco_admin';
$pass = 'pharmaadmin';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected to LIVE DB successfully.\n";

    // 1. Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $tablesWithData = [];
    $tablesStructureOnly = [];

    foreach ($tables as $table) {
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
        $count = $countStmt->fetchColumn();

        if ($count > 500) {
            $tablesStructureOnly[] = $table;
        } else {
            $tablesWithData[] = $table;
        }
    }

    echo "Tables with > 500 rows (Structure only): " . count($tablesStructureOnly) . "\n";
    echo "Tables with <= 500 rows (Data included): " . count($tablesWithData) . "\n";

    $mysqldumpPath = 'c:\xampp\mysql\bin\mysqldump.exe';
    
    // Command 1: Dump structure for ALL tables
    echo "Dumping structure for all tables...\n";
    $cmd1 = "\"$mysqldumpPath\" -h $host -u $user -p$pass --no-data $db > live_db_structure.sql";
    exec($cmd1);

    // Command 2: Dump data for tables with <= 500 rows
    echo "Dumping data for small tables...\n";
    if (!empty($tablesWithData)) {
        $tablesList = implode(' ', $tablesWithData);
        $cmd2 = "\"$mysqldumpPath\" -h $host -u $user -p$pass --no-create-info $db $tablesList > live_db_data.sql";
        exec($cmd2);
    }

    echo "Backup completed successfully.\n";

} catch (\PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
