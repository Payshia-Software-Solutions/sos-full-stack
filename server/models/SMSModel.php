<?php
// models/SMSModel.php

class SMSModel
{
    private $authToken;
    private $senderId;
    private $templatePath;

    public function __construct($authToken, $senderId, $templatePath)
    {
        $this->authToken = $authToken;
        $this->senderId = $senderId;
        $this->templatePath = $templatePath;
    }

    private function getTemplateFromDB($templateName)
    {
        $pdo = $GLOBALS['pdo'] ?? null;
        if (!$pdo) {
            return false;
        }
        $stmt = $pdo->prepare('SELECT template_content FROM sms_templates WHERE template_name = ?');
        $stmt->execute([$templateName]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && isset($row['template_content'])) {
            return $row['template_content'];
        }
        return false;
    }

    public function sendWelcomeSMS($mobile, $studentName, $referenceNumber, $tempPassword = '', $courseName = '')
    {
        // Try to load the template from DB first
        $template = $this->getTemplateFromDB('account-activation-message');
        if (!$template) {
            // Load the template from the file as fallback
            $template = file_get_contents($this->templatePath);
        }
        if (!$template) {
            throw new Exception("Unable to load SMS template.");
        }

        // Replace placeholders with actual data
        $message = str_replace(
            ['[STUDENT_NAME]', '[REFERENCE_NUMBER]', '{name}', '{index}', '{{FIRST_NAME}}', '{{COURSE_NAME}}', '{course_name}', '{{GENERATED_USER_NAME}}', '{{TEMP_PASSWORD}}', '{temp_password}'],
            [$studentName, $referenceNumber, $studentName, $referenceNumber, $studentName, $courseName, $courseName, $referenceNumber, $tempPassword, $tempPassword],
            $template
        );

        // Send SMS
        return $this->sendSMS($mobile, $this->senderId, $message);
    }

    public function sendPaymentUpdateSMS($mobile, $studentName, $courseName, $paymentAmount, $receiptNumber)
    {
        // Try to load the template from DB first
        $template = $this->getTemplateFromDB('payment-update-message');
        if (!$template) {
            // Load the template from the file as fallback if DB fails or missing
            $template = "Dear [STUDENT_NAME], we have received your payment of LKR [PAYMENT_AMOUNT] for [COURSE_NAME]. Receipt No: [RECEIPT_NUMBER]. Thank you! - Pharma College";
        }
        
        $message = str_replace(
            ['[STUDENT_NAME]', '[COURSE_NAME]', '[PAYMENT_AMOUNT]', '[RECEIPT_NUMBER]'],
            [$studentName, $courseName, number_format($paymentAmount, 2), $receiptNumber],
            $template
        );

        return $this->sendSMS($mobile, $this->senderId, $message);
    }

    public function sendConvocationPaymentApprovedSMS($mobile, $studentName, $referenceNumber, $receiptNumber, $paymentAmount)
    {
        // Load the convocation SMS template from DB first, fallback to file
        $template = $this->getTemplateFromDB('convocation-payment-approved');
        if (!$template) {
            $template = file_get_contents('templates/convocation-payment-message.txt');
        }
        if (!$template) {
            throw new Exception("Unable to load convocation SMS template.");
        }

        // Replace placeholders with actual data
        $message = str_replace(
            ['[STUDENT_NAME]', '[REFERENCE_NUMBER]', '[RECEIPT_NUMBER]', '[PAYMENT_AMOUNT]'],
            [$studentName, $referenceNumber, $receiptNumber, $paymentAmount],
            $template
        );


        // Send SMS
        return $this->sendSMS($mobile, $this->senderId, $message);
    }


    public function sendCeremonyNumberSMS($mobile, $studentName, $ceremonyNumber)
    {
        // Load the SMS template from DB first, fallback to file
        $template = $this->getTemplateFromDB('ceremony-number-message');
        if (!$template) {
            $template = file_get_contents('templates/ceremony-number-message.txt');
        }
        if (!$template) {
            throw new Exception("Unable to load ceremony SMS template.");
        }

        // Replace placeholders with actual data
        $message = str_replace(
            ['{{FIRST_NAME}}', '{{CEREMONY_NUMBER}}'],
            [$studentName, $ceremonyNumber],
            $template
        );

        // Send SMS
        return $this->sendSMS($mobile, $this->senderId, $message);
    }

    public function sendNameOnCertificateSMS($mobile, $studentName, $studenNumber)
    {
        $templatePath = 'templates/name-on-certificate-message.txt';

        // Check if template file exists
        $template = $this->getTemplateFromDB('name-on-certificate-message');
        if (!$template) {
            if (file_exists($templatePath)) {
                $template = file_get_contents($templatePath);
            }
        }
        
        if (!$template || trim($template) === '') {
            throw new Exception("Unable to read or empty SMS template.");
        }

        // Replace placeholders
        $message = str_replace(
            ['{{STUDENT_NUMBER}}', '{{NAME_ON_CERTIFICATE}}'],
            [$studenNumber, $studentName],
            $template
        );

        // Optionally trim and sanitize the message (for SMS length limit)
        $message = trim($message);

        // Send SMS
        // $mobile = '0770481363';
        return $this->sendSMS($mobile, $this->senderId, $message);
    }


    public function sendCeremonyDueBreakdownSMS($mobile, $studentName, $courseBalance, $convocationBalance)
    {
        // Load the SMS template from DB first, fallback to file
        $template = $this->getTemplateFromDB('ceremony-due-breakdown-message');
        if (!$template) {
            $template = file_get_contents('templates/ceremony-due-breakdown-message.txt');
        }
        if (!$template) {
            throw new Exception("Unable to load due breakdown SMS template.");
        }

        // Calculate total
        $totalDue = $courseBalance + $convocationBalance;

        // Replace placeholders
        $message = str_replace(
            ['{{FIRST_NAME}}', '{{COURSE_BALANCE}}', '{{CONVOCATION_BALANCE}}', '{{TOTAL_DUE}}'],
            [$studentName, number_format($courseBalance, 2), number_format($convocationBalance, 2), number_format($totalDue, 2)],
            $template
        );

        // Send SMS
        return $this->sendSMS($mobile, $this->senderId, $message);
    }



    public function sendSMS($mobile, $senderId, $message)
    {

        if (!preg_match('/^0/', $mobile)) {
            $mobile = '0' . $mobile;
        }
        $msgdata = [
            "recipient" => $mobile,
            "sender_id" => $senderId,
            "message" => $message
        ];

        $curl = curl_init();

        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);

        curl_setopt_array($curl, [
            CURLOPT_URL => "https://sms.send.lk/api/v3/sms/send",
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => json_encode($msgdata),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "accept: application/json",
                "authorization: Bearer {$this->authToken}",
                "cache-control: no-cache",
                "content-type: application/x-www-form-urlencoded",
            ],
        ]);

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            return ['status' => 'error', 'message' => $err];
        } else {
            return json_decode($response, true);
        }
    }

    public function sendOrderSMS($mobile, $studentName)
    {
        // Load the order SMS template from DB first, fallback to file
        $template = $this->getTemplateFromDB('study-pack-not-order');
        if (!$template) {
            $template = file_get_contents('templates/study-pack-not-order.txt');
        }
        if (!$template) {
            throw new Exception("Unable to load order SMS template.");
        }

        // Replace placeholders with actual data
        $message = str_replace(
            ['{{FIRST_NAME}}'],
            [$studentName],
            $template
        );

        // Send SMS
        return $this->sendSMS($mobile, $this->senderId, $message);
    }
}
