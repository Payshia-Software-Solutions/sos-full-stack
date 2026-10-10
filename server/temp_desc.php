<?php
require 'config/database.php';
$db = new Database();
$pdo = $db->connect();
$stmt = $pdo->query("DESCRIBE prescription");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
