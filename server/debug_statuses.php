<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("SELECT DISTINCT grade_status FROM win_pharma_submission");
$statuses = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Unique statuses:\n";
foreach ($statuses as $status) {
    echo "[" . $status . "]\n";
}
