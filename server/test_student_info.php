<?php
// test_student_info.php
$_GET['loggedUser'] = 'STU12345'; // Let's set a test username

// Include database connection
$GLOBALS['pdo'] = new PDO('mysql:host=localhost;dbname=lms', 'root', ''); // Adjust db name, user, password if needed

require_once './controllers/CertificationCenter/CcEvaluationController.php';

$controller = new CcEvaluationController($GLOBALS['pdo']);
$controller->GetStudentFullDetails('STU12345');
