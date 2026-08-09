<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->prepare("SELECT id, email_address, aprroved_status, index_number FROM temp_lms_user WHERE email_address = 'rashumaleesha8@gmail.com'");
    $stmt->execute();
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
