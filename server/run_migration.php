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

    echo "Successfully connected to the database: $dbname\n";

    // 1. Create migrations table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS `migrations` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `migration` VARCHAR(255) NOT NULL,
        `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;");

    // 2. Scan migrations directory
    $migrationsDir = __DIR__ . '/migrations';
    if (!is_dir($migrationsDir)) {
        die("Migrations directory not found: $migrationsDir\n");
    }

    $files = scandir($migrationsDir);
    $sqlFiles = array_filter($files, function ($f) {
        return pathinfo($f, PATHINFO_EXTENSION) === 'sql';
    });

    sort($sqlFiles); // Ensure consistent order

    // 3. Get already applied migrations
    $stmt = $pdo->query("SELECT migration FROM migrations");
    $appliedMigrations = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Found " . count($sqlFiles) . " migration files.\n";

    $appliedCount = 0;
    foreach ($sqlFiles as $file) {
        if (in_array($file, $appliedMigrations)) {
            echo "Skipping already applied migration: $file\n";
            continue;
        }

        echo "Applying migration: $file ... ";
        $sql = file_get_contents($migrationsDir . '/' . $file);
        
        // Execute the SQL
        // Using exec for multi-statement scripts if needed, but be careful with semi-colons
        try {
            $pdo->exec($sql);
            
            // Record migration
            $stmt = $pdo->prepare("INSERT INTO migrations (migration) VALUES (?)");
            $stmt->execute([$file]);
            
            echo "SUCCESS!\n";
            $appliedCount++;
        } catch (PDOException $e) {
            echo "FAILED!\n";
            echo "Error details: " . $e->getMessage() . "\n";
            // Continue or stop? Usually stop on failure in migrations.
            exit(1);
        }
    }

    echo "\nSummary: $appliedCount migrations applied successfully.\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
} catch (Exception $e) {
    die("General Error: " . $e->getMessage() . "\n");
}
