<?php
// models/EmailModel.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;



require_once __DIR__ . '/../vendor/autoload.php'; // Make sure PHPMailer is installed via Composer

class EmailModel
{
    private $mailer;
    private $templatePath;

    public function __construct($host, $username, $password, $fromEmail, $fromName, $templatePath)
    {
        $this->mailer = new PHPMailer(true);
        $this->templatePath = $templatePath;

        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = $host;
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = 'results@pharmacollege.lk';
            $this->mailer->Password = 'Chikki@2025';
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $this->mailer->Port = 465;

            // Sender info
            $this->mailer->setFrom($fromEmail, $fromName);
            $this->mailer->isHTML(true);
        } catch (Exception $e) {
            throw new Exception("Mailer setup error: " . $e->getMessage());
        }
    }

    public function sendWelcomeEmail($toEmail, $studentName, $referenceNumber)
    {
        $template = file_get_contents($this->templatePath);
        if (!$template) {
            throw new Exception("Unable to load email template.");
        }

        $body = str_replace(
            ['[STUDENT_NAME]', '[REFERENCE_NUMBER]'],
            [$studentName, $referenceNumber],
            $template
        );

        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($toEmail);
            $this->mailer->Subject = "Welcome to Our Institute";
            $this->mailer->Body = $body;

            $this->mailer->send();

            return ['status' => 'success', 'message' => 'Email sent successfully.'];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $this->mailer->ErrorInfo];
        }
    }




    public function sendGenericEmail($toEmail, $subject, $body)
    {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($toEmail);
            $this->mailer->addBCC('hansikamali98@gmail.com');
            $this->mailer->addBCC('thilinaruwan112@gmail.com');
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $body;

            $this->mailer->send();

            return json_encode(['status' => 'success', 'message' => $body . 'Email sent successfully.']);
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $this->mailer->ErrorInfo];
        }
    }
}
