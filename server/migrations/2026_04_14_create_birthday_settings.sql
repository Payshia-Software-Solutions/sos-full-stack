CREATE TABLE IF NOT EXISTS `birthday_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sms_template` TEXT NOT NULL,
    `email_subject` VARCHAR(255) NOT NULL,
    `email_template` TEXT NOT NULL,
    `is_sms_enabled` BOOLEAN DEFAULT FALSE,
    `is_email_enabled` BOOLEAN DEFAULT FALSE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert initial default settings
INSERT INTO `birthday_settings` (`sms_template`, `email_subject`, `email_template`, `is_sms_enabled`, `is_email_enabled`)
VALUES (
    'Happy Birthday {{FIRST_NAME}}! We wish you a wonderful day ahead. From SOS.',
    'Happy Birthday {{FIRST_NAME}}!',
    '<p>Dear {{FULL_NAME}},</p><p>We wish you a very Happy Birthday! May your day be filled with joy and success.</p><p>Best Regards,<br>SOS Team</p>',
    0,
    0
);
