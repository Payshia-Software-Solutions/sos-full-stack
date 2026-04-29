<?php
// Override host for CLI
$host = '127.0.0.1';
$db   = 'pharmaco_pharmacollege';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}


function getCount($pdo, $table, $where = "") {
    $sql = "SELECT COUNT(*) FROM `$table` $where";
    try {
        $stmt = $pdo->query($sql);
        return $stmt->fetchColumn();
    } catch (Exception $e) {
        return "Error: " . $e->getMessage();
    }
}

echo "Total medi_mind_levels: " . getCount($pdo, "medi_mind_levels") . "\n";
echo "Total medi_mind_quetions: " . getCount($pdo, "medi_mind_quetions") . "\n";
echo "Total medi_mind_level_questions: " . getCount($pdo, "medi_mind_level_questions") . "\n";
echo "Mappings for level_id = 3: " . getCount($pdo, "medi_mind_level_questions", "WHERE level_id = 3") . "\n";

// Check if Level 3 exists
$stmt = $pdo->prepare("SELECT * FROM medi_mind_levels WHERE id = 3");
$stmt->execute();
$level3 = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Level 3 Details: " . json_encode($level3) . "\n";

// Check mappings for level 3 and see if questions exist
$stmt = $pdo->prepare("SELECT lq.question_id, q.id as q_id FROM medi_mind_level_questions lq LEFT JOIN medi_mind_quetions q ON lq.question_id = q.id WHERE lq.level_id = 3");
$stmt->execute();
$mappings = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Level 3 Mappings (Question ID vs Found ID):\n";
foreach ($mappings as $m) {
    echo "LQ Question ID: " . $m['question_id'] . " | Found in quetions: " . ($m['q_id'] ? "YES" : "NO") . "\n";
}
