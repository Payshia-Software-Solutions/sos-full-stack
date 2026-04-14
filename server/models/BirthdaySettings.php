<?php

class BirthdaySettings
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getSettings()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `birthday_settings` LIMIT 1");
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateSettings($data)
    {
        $sql = "UPDATE `birthday_settings` SET 
                `sms_template` = :sms_template, 
                `email_subject` = :email_subject, 
                `email_template` = :email_template, 
                `is_sms_enabled` = :is_sms_enabled, 
                `is_email_enabled` = :is_email_enabled 
                WHERE `id` = :id";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'sms_template' => $data['sms_template'],
            'email_subject' => $data['email_subject'],
            'email_template' => $data['email_template'],
            'is_sms_enabled' => $data['is_sms_enabled'],
            'is_email_enabled' => $data['is_email_enabled'],
            'id' => $data['id']
        ]);
    }
}
