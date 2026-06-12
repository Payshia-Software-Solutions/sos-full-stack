<?php

$liveHost = '91.204.209.19';
$liveDb   = 'pharmaco_pharmacollege';
$liveUser = 'pharmaco_admin';
$livePass = 'pharmaadmin';
$charset = 'utf8mb4';

$localHost = '127.0.0.1';
$localDb   = 'pharmaco_pharmacollege';
$localUser = 'root';
$localPass = '';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $livePdo = new PDO("mysql:host=$liveHost;dbname=$liveDb;charset=$charset", $liveUser, $livePass, $options);
    $localPdo = new PDO("mysql:host=$localHost;dbname=$localDb;charset=$charset", $localUser, $localPass, $options);
    
    echo "Connected to both databases.\n";

    // 1. Fetch Admin users
    $stmt = $livePdo->query("SELECT * FROM users WHERE userlevel = 'Admin' OR userlevel LIKE '%admin%'");
    $admins = $stmt->fetchAll();
    
    // 2. Fetch 50 other users
    $stmt = $livePdo->query("SELECT * FROM users WHERE userlevel != 'Admin' AND userlevel NOT LIKE '%admin%' LIMIT 50");
    $otherUsers = $stmt->fetchAll();
    
    $allUsers = array_merge($admins, $otherUsers);
    
    echo "Fetched " . count($allUsers) . " users from live DB.\n";
    
    if (count($allUsers) > 0) {
        // Get column names dynamically
        $columns = array_keys($allUsers[0]);
        $colStr = implode("`, `", $columns);
        $placeholders = implode(", ", array_fill(0, count($columns), "?"));
        
        $insertQuery = "INSERT IGNORE INTO users (`$colStr`) VALUES ($placeholders)";
        $insertStmt = $localPdo->prepare($insertQuery);
        
        $inserted = 0;
        foreach ($allUsers as $user) {
            $insertStmt->execute(array_values($user));
            $inserted++;
        }
        
        echo "Successfully inserted $inserted users into local DB.\n";
    }

} catch (\PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
