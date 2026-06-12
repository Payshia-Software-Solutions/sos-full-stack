<?php
require_once 'vendor/autoload.php';
require_once 'models/CertificationCenter/CcEvaluation.php';

// Mock PDO or just instantiate CcEvaluation if it doesn't strictly need a web request
class Test extends CcEvaluation {
    public function __construct() {
        // Need a DB connection
        $host = 'localhost';
        $db   = 'pharmaco_pharmacollege'; // or whatever the db name is
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        try {
            $this->pdo = new PDO($dsn, $user, $pass);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
            exit;
        }
    }
}

$test = new Test();
// $res = $test->GetMediMindProgress("CPCC28", "SOS001");
$res = $test->getUserEnrollmentsFullDetails("SOS001");
echo json_encode($res, JSON_PRETTY_PRINT);
