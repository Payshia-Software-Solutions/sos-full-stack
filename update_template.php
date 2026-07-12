<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        UPDATE `sms_templates` SET `template_content` = 'Dear {{FIRST_NAME}},\n\nYou have been successfully enrolled in {{COURSE_NAME}}.\nIndex No: {{GENERATED_USER_NAME}}\nTemporary Password: {{TEMP_PASSWORD}}\n\nLogin here: https://lms.pharmacollege.lk/login?UserName={{GENERATED_USER_NAME}}&TempPassword={{TEMP_PASSWORD}}\n\nHow to Order Study Pack - https://www.youtube.com/shorts/1xd3TAjbtYw\n\nCeylon Pharma College\nwww.pharmacollege.lk' WHERE `template_name` = 'account-activation-message';
    ");
    echo "Updated local DB successfully";
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
