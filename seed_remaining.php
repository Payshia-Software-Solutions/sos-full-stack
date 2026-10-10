<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        INSERT IGNORE INTO `sms_templates` (`template_name`, `template_content`) VALUES 
        ('ceremony-number-message', 'Dear {{FIRST_NAME}},\nYour ceremony registration was successfully completed.\nCeremony No: {{CEREMONY_NUMBER}}\n\n-Ceylon Pharma College'),
        ('name-on-certificate-message', 'Dear Student ({{STUDENT_NUMBER}}),\nYour certificate is ready to print. Name on certificate: {{NAME_ON_CERTIFICATE}}.\nThank You!'),
        ('ceremony-due-breakdown-message', 'Dear {{FIRST_NAME}},\nYour Ceremony Number is not processed due to unpaid balances:\nCourse: Rs. {{COURSE_BALANCE}}\nConvocation: Rs. {{CONVOCATION_BALANCE}}\nTotal: Rs. {{TOTAL_DUE}}\n\nPlease complete payment.\n-Ceylon Pharma College')
    ");
    echo "Inserted remaining templates successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
