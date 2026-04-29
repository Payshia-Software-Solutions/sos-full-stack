<?php
require_once 'config/database.php';

function dumpTable($pdo, $tableName, $where = "") {
    echo "--- $tableName $where ---\n";
    $query = "SELECT * FROM `$tableName` $where";
    try {
        $stmt = $pdo->query($query);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($results as $row) {
            print_r($row);
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

dumpTable($pdo, "medi_mind_levels");
dumpTable($pdo, "medi_mind_quetions");
dumpTable($pdo, "medi_mind_level_questions", "WHERE level_id = 3");
dumpTable($pdo, "medi_mind_level_medicines", "WHERE level_id = 3");
dumpTable($pdo, "medi_mind_level_questions", "WHERE level_id = 2"); // Check level 1 as well
