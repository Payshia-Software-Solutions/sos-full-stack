<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec($sql);
    echo "Tables successfully fixed!";
} catch (Exception $e) {
    echo $e->getMessage();
}
