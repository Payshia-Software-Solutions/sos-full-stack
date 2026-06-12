<?php
$pdo = new PDO('mysql:host=localhost;dbname=sos', 'root', '');
$stmt = $pdo->query("SELECT * FROM cc_criteria_list");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
