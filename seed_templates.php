<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        INSERT IGNORE INTO `sms_templates` (`template_name`, `template_content`) VALUES 
        ('account-activation-message', 'Dear {name}, Your account has been activated! Your index number is {index}. Thank you.'),
        ('convocation-payment-approved', 'Dear student, your convocation payment has been approved.'),
        ('study-pack-not-order', 'Dear student, please order your study pack.')
    ");
    echo "Inserted successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
