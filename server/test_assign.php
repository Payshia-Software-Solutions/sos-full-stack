<?php
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/ReaderMedicine.php';

try {
    $model = new ReaderMedicine($pdo);
    $result = $model->assignToCourse(1, 'CPCC32', 'testuser');
    print_r($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
