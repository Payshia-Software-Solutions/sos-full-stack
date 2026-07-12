<?php
// routes/smsTemplateRoutes.php

require_once './controllers/SmsTemplateController.php';

$pdo = $GLOBALS['pdo'];
$smsTemplateController = new SmsTemplateController($pdo);

return [
    'GET /sms-templates' => [$smsTemplateController, 'getAllTemplates'],
    'GET /sms-templates/{id}' => [$smsTemplateController, 'getTemplateById'],
    'PUT /sms-templates/{id}' => [$smsTemplateController, 'updateTemplate'],
];
