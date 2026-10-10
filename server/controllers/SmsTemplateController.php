<?php
// controllers/SmsTemplateController.php

require_once './models/SmsTemplate.php';

class SmsTemplateController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new SmsTemplate($pdo);
    }

    public function getAllTemplates()
    {
        $templates = $this->model->getAllTemplates();
        echo json_encode($templates);
    }

    public function getTemplateById($id)
    {
        $template = $this->model->getTemplateById($id);
        if ($template) {
            echo json_encode($template);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Template not found']);
        }
    }

    public function updateTemplate($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['template_content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing template_content']);
            return;
        }

        try {
            $this->model->updateTemplate($id, $data['template_content']);
            echo json_encode(['message' => 'Template updated successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Failed to update template', 'details' => $e->getMessage()]);
        }
    }
}
