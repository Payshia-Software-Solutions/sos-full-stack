<?php
require 'config/database.php';
try {
    $pdo->exec("ALTER TABLE prescription ADD COLUMN drugs_written_list TEXT DEFAULT NULL AFTER drugs_list");
    echo "Column added successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
