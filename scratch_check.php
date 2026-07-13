<?php
require 'server/config/database.php';
$stmt = $pdo->query('SHOW COLUMNS FROM course_content');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
