<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE sms_templates ( id INT PRIMARY KEY )");
    echo "Created successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
