<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->query("SHOW CREATE TABLE temp_lms_user");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo $row['Create Table'];
} catch (Exception $e) {
    echo $e->getMessage();
}
