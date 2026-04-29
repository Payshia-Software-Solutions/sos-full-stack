<?php
require_once 'config/database.php';

function describeTable($pdo, $tableName) {
    echo "--- DESCRIBE $tableName ---\n";
    try {
        $stmt = $pdo->query("DESCRIBE `$tableName`");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($results as $row) {
            print_r($row);
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

describeTable($pdo, "medi_mind_level_questions");
describeTable($pdo, "medi_mind_quetions");
describeTable($pdo, "medi_mind_levels");
