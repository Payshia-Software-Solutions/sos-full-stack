<?php

require_once 'vendor/autoload.php';

// Load .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Database configuration
$host = $_ENV['DB_HOST'];
$dbname = $_ENV['DB_DATABASE'];
$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read the SQL file
    $sql = file_get_contents('migrations/add_convocation_id_to_convocation_registrations.sql');

    // Execute the SQL
    $pdo->exec($sql);

    echo "Migration successful!\n";

} catch (PDOException $e) {
    die("Could not connect to the database $dbname :" . $e->getMessage());
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
