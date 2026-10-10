<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/CertificationCenter/CcEvaluation.php';

$pdo = (new Database())->getConnection();
$model = new CcEvaluation($pdo);
$res = $model->GetLmsStudentsByUserName('PA34001');
var_dump($res);
