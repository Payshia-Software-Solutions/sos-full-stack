<?php
// models/SmsTemplate.php

class SmsTemplate
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllTemplates()
    {
        $stmt = $this->pdo->prepare('SELECT * FROM sms_templates');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getTemplateById($id)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM sms_templates WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getTemplateByName($name)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM sms_templates WHERE template_name = ?');
        $stmt->execute([$name]);
        return $stmt->fetch();
    }

    public function updateTemplate($id, $content)
    {
        $stmt = $this->pdo->prepare('UPDATE sms_templates SET template_content = ? WHERE id = ?');
        return $stmt->execute([$content, $id]);
    }

    public function createTemplate($name, $content)
    {
        $stmt = $this->pdo->prepare('INSERT INTO sms_templates (template_name, template_content) VALUES (?, ?)');
        return $stmt->execute([$name, $content]);
    }
}
