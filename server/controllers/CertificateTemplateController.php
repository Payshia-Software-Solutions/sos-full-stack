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
            $docType = $_GET['doc_type'] ?? 'Certificate';

            if (strtoupper($docType) === 'TRANSCRIPT') {
                $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE (course_code = ? OR course_code = ?) AND (template_name LIKE '%Transcript%' OR template_json LIKE '%Transcript%' OR course_code LIKE '%TRANSCRIPT%') ORDER BY template_id DESC LIMIT 1");
                $stmt->execute([$courseCode, $courseCode . '_TRANSCRIPT']);
            } else {
                $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE course_code = ? AND template_name NOT LIKE '%Transcript%' AND (template_json NOT LIKE '%Transcript%' OR template_json IS NULL) ORDER BY template_id DESC LIMIT 1");
                $stmt->execute([$courseCode]);
                
                // Fallback if no specific cert record found
                if (!$stmt->rowCount()) {
                    $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE course_code = ? ORDER BY template_id ASC LIMIT 1");
                    $stmt->execute([$courseCode]);
                }
            }

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
        
        $rawCourseCode = $data->course_code ?? null;
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
        $docType = $data->docType ?? $data->doc_type ?? null;

        if (!$docType && $templateName && strpos(strtolower($templateName), 'transcript') !== false) {
            $docType = 'Transcript';
        }
        if (!$docType) {
            $docType = 'Certificate';
        }

        $templateJson = null;
        if (isset($data->template_json)) {
            $templateJson = is_string($data->template_json) ? $data->template_json : json_encode($data->template_json);
        }

        if (!$rawCourseCode) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing course_code']);
            return;
        }

        $cleanCourseCode = str_replace('_TRANSCRIPT', '', $rawCourseCode);

        try {
            if ($docType === 'Transcript') {
                $dbCourseCode = $cleanCourseCode . '_TRANSCRIPT';
                if (!$templateName) {
                    $templateName = "Transcript for " . $cleanCourseCode;
                }

                $stmt = $this->pdo->prepare("SELECT template_id FROM certificate_template WHERE (course_code = ? OR course_code = ?) AND (template_name LIKE '%Transcript%' OR template_json LIKE '%Transcript%' OR course_code LIKE '%TRANSCRIPT%') LIMIT 1");
                $stmt->execute([$cleanCourseCode, $dbCourseCode]);
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
                        course_code = ?,
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
                        $dbCourseCode,
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
                        $dbCourseCode, 
                        $orientation,
                        $templateJson
                    ]);
                }
            } else {
                $dbCourseCode = $cleanCourseCode;
                if (!$templateName) {
                    $templateName = "Certificate for " . $cleanCourseCode;
                }

                $stmt = $this->pdo->prepare("SELECT template_id FROM certificate_template WHERE course_code = ? AND template_name NOT LIKE '%Transcript%' AND (template_json NOT LIKE '%Transcript%' OR template_json IS NULL) LIMIT 1");
                $stmt->execute([$dbCourseCode]);
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
                        $dbCourseCode, 
                        $orientation,
                        $templateJson
                    ]);
                }
            }

            echo json_encode(['success' => true, 'message' => 'Template saved successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
