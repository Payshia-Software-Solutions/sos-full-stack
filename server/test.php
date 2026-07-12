<?php
require './config/database.php';
$stmt = $pdo->query('SELECT id, current_status FROM delivery_orders ORDER BY id DESC LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
