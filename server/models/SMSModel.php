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

    public function sendWelcomeSMS($mobile, $studentName, $referenceNumber)
    {
        // Load the template from the file
        $template = file_get_contents($this->templatePath);
        if (!$template) {
            throw new Exception("Unable to load SMS template.");
        }

        // Replace placeholders with actual data
        $message = str_replace(
            ['[STUDENT_NAME]', '[REFERENCE_NUMBER]'],
            [$studentName, $referenceNumber],
            $template
        );

        // Send SMS
        return $this->sendSMS($mobile, $this->senderId, $message);
    }

    public function sendConvocationPaymentApprovedSMS($mobile, $studentName, $referenceNumber, $receiptNumber, $paymentAmount)
    {
        // Load the convocation SMS template from file
        $template = file_get_contents('templates/convocation-payment-message.txt');
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
        // Load the SMS template from file
        $template = file_get_contents('templates/ceremony-number-message.txt');
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
        if (!file_exists($templatePath)) {
            throw new Exception("SMS template file not found at path: $templatePath");
        }

        // Read template content
        $template = file_get_contents($templatePath);
        if ($template === false || trim($template) === '') {
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
        // Load the SMS template from file
        $template = file_get_contents('templates/ceremony-due-breakdown-message.txt');
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
        // Load the order SMS template from file
        $template = file_get_contents('templates/study-pack-not-order.txt');
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
