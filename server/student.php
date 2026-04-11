<?php
// Database connection details
$host = 'localhost';
$db   = 'pharmaco_pharmacollege'; // Your database name
$user = 'root';                   // Your database username
$pass = '';                        // Your database password
$charset = 'utf8mb4';              // Charset

// Set DSN (Data Source Name) for the PDO connection
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Create a PDO instance (database connection)
try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Enable error reporting
} catch (PDOException $e) {
    // Handle the error if the connection fails
    echo "Connection failed: " . $e->getMessage();
    exit;
}

// Include necessary files (Model and Controller)
require_once './models/Student/StudentCourse.php';
require_once './controllers/Student/StudentCourseController.php';

// Create the controller instance
$studentCourseController = new StudentCourseController($pdo);

// Get the requested URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Check if the URL matches the student-courses/student/ path
if (strpos($requestUri, '/student-courses/student/') !== false) {
    // Handle the case where a studentId is provided as a query parameter
    if ($method === 'GET' && isset($_GET['studentId'])) {
        $studentId = $_GET['studentId'];
        
        // Call the controller method to fetch records by student ID
        $studentCourseController->getRecordsByStudentId($studentId);
    } else {
        // If no studentId is provided, return a 400 error
        http_response_code(400);
        echo json_encode(['error' => 'studentId is required']);
    }
} else {
    // Return a 404 error if the route is not found
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}
