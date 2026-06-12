<?php
require_once 'vendor/autoload.php';
require_once 'models/CertificationCenter/CcEvaluation.php';

class Test extends CcEvaluation {
    public function __construct() {
        $host = 'localhost';
        $db   = 'pharmaco_pharmacollege';
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        try {
            $this->pdo = new PDO($dsn, $user, $pass);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Wait, CcEvaluation uses $this->db sometimes!
            $this->db = $this->pdo; 
        } catch (\PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
            exit;
        }
    }
}

$test = new Test();
$res = $test->getUserEnrollmentsFullDetails("PA30001");
echo json_encode($res, JSON_PRETTY_PRINT);
