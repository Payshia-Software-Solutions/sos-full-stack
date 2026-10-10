<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        INSERT IGNORE INTO `sms_templates` (`template_name`, `template_content`) VALUES 
        ('payment-update-message', 'Dear [STUDENT_NAME], we have received your payment of LKR [PAYMENT_AMOUNT] for [COURSE_NAME]. Receipt No: [RECEIPT_NUMBER]. Thank you! - Pharma College')
    ");
    echo "Inserted payment-update-message successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
