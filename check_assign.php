<?php
require_once __DIR__ . '/server/config/database.php';
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM pharma_reader_course_assignments WHERE course_code = :cc");
$stmt->execute(['cc' => 'CPCC31']);
echo "Total assigned to CPCC31: " . $stmt->fetchColumn() . "\n";

$stmt2 = $pdo->prepare("
SELECT m.difficulty, COUNT(m.id) as cnt 
FROM reader_medicine m 
JOIN pharma_reader_course_assignments ca ON m.id = ca.prescription_id 
WHERE ca.course_code = :course_code AND m.active_status = 'Active'
GROUP BY m.difficulty
");
$stmt2->execute(['course_code' => 'CPCC31']);
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
