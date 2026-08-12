<?php
require_once __DIR__ . '/../config/database.php';

class CertificateTemplateController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getTemplate($courseCode) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE course_code = ?");
            $stmt->execute([$courseCode]);
            $template = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($template) {
                echo json_encode(['success' => true, 'template' => $template]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Template not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function saveTemplate() {
        $jsonInput = file_get_contents("php://input");
        if (empty($jsonInput) && file_exists(__DIR__ . '/../payload.json')) {
            $jsonInput = file_get_contents(__DIR__ . '/../payload.json');
        }
        $data = json_decode($jsonInput);
        
        $courseCode = $data->course_code ?? null;
        $templateName = $data->template_name ?? null;
        $leftMargin = isset($data->left_margin) ? intval($data->left_margin) : 0;
        $topToName = isset($data->top_to_name) ? intval($data->top_to_name) : 0;
        $leftToDate = isset($data->left_to_date) ? intval($data->left_to_date) : 0;
        $topToDate = isset($data->top_to_date) ? intval($data->top_to_date) : 0;
        $leftToQr = isset($data->left_to_qr) ? intval($data->left_to_qr) : 0;
        $topToQr = isset($data->top_to_qr) ? intval($data->top_to_qr) : 0;
        $qrWidth = isset($data->qr_width) ? intval($data->qr_width) : 100;
        $isActive = isset($data->is_active) ? intval($data->is_active) : 1;
        $backImage = $data->back_image ?? '';
        $orientation = $data->orientation ?? 'Landscape';
        $templateJson = isset($data->template_json) ? json_encode($data->template_json) : null;

        if (!$courseCode) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing course_code']);
            return;
        }

        if (!$templateName) {
            $templateName = "Template for " . $courseCode;
        }

        try {
            // Check if exists
            $stmt = $this->pdo->prepare("SELECT template_id FROM certificate_template WHERE course_code = ?");
            $stmt->execute([$courseCode]);
            $exists = $stmt->fetch();

            if ($exists) {
                $templateId = $exists['template_id'];
                $updateStmt = $this->pdo->prepare("UPDATE certificate_template SET 
                    template_name = ?, 
                    left_margin = ?, 
                    top_to_name = ?, 
                    left_to_date = ?, 
                    top_to_date = ?, 
                    left_to_qr = ?, 
                    top_to_qr = ?, 
                    qr_width = ?, 
                    is_active = ?, 
                    back_image = ?, 
                    orientation = ?,
                    template_json = ? 
                    WHERE template_id = ?");
                $updateStmt->execute([
                    $templateName, 
                    $leftMargin, 
                    $topToName, 
                    $leftToDate, 
                    $topToDate, 
                    $leftToQr, 
                    $topToQr, 
                    $qrWidth, 
                    $isActive, 
                    $backImage, 
                    $orientation, 
                    $templateJson,
                    $templateId
                ]);
            } else {
                $insertStmt = $this->pdo->prepare("INSERT INTO certificate_template 
                    (template_name, left_margin, top_to_name, left_to_date, top_to_date, left_to_qr, top_to_qr, qr_width, is_active, back_image, course_code, orientation, template_json) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $insertStmt->execute([
                    $templateName, 
                    $leftMargin, 
                    $topToName, 
                    $leftToDate, 
                    $topToDate, 
                    $leftToQr, 
                    $topToQr, 
                    $qrWidth, 
                    $isActive, 
                    $backImage, 
                    $courseCode, 
                    $orientation,
                    $templateJson
                ]);
            }

            echo json_encode(['success' => true, 'message' => 'Template saved successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
