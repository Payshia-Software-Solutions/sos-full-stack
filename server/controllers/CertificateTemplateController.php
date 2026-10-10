<?php
require_once __DIR__ . '/../config/database.php';

class CertificateTemplateController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function migrateLegacyTranscripts() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM transcript_templates");
            if (!$stmt) return;
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $row) {
                if (empty($row['template_data'])) continue;
                $courseId = $row['course_id'];
                
                // Find course_code from parent_course table
                $cStmt = $this->pdo->prepare("SELECT course_code FROM parent_course WHERE id = ? OR course_code = ? LIMIT 1");
                $cStmt->execute([$courseId, $courseId]);
                $cRow = $cStmt->fetch(PDO::FETCH_ASSOC);
                $courseCode = $cRow['course_code'] ?? $courseId;

                $dbCourseCode = $courseCode . '_TRANSCRIPT';
                
                // Check if already in certificate_template - DO NOT OVERWRITE IF IT ALREADY EXISTS!
                $chk = $this->pdo->prepare("SELECT template_id FROM certificate_template WHERE course_code = ? OR (course_code = ? AND (template_name LIKE '%Transcript%' OR template_json LIKE '%Transcript%'))");
                $chk->execute([$dbCourseCode, $courseCode]);
                $exists = $chk->fetch();

                if ($exists) {
                    // Already migrated / saved in certificate_template, skip overwriting
                    continue;
                }

                $parsed = is_string($row['template_data']) ? json_decode($row['template_data'], true) : $row['template_data'];
                if (!$parsed || !isset($parsed['elements'])) continue;

                $tName = $parsed['template_name'] ?? 'Transcript for ' . $courseCode;
                $bImg = $parsed['backImage'] ?? '';
                $orient = $parsed['orientation'] ?? 'Portrait';
                $tJson = json_encode([
                    'docType' => 'Transcript',
                    'pageSize' => $parsed['pageSize'] ?? 'A4',
                    'orientation' => $orient,
                    'elements' => $parsed['elements'] ?? []
                ]);

                $ins = $this->pdo->prepare("INSERT INTO certificate_template 
                    (template_name, left_margin, top_to_name, left_to_date, top_to_date, left_to_qr, top_to_qr, qr_width, is_active, back_image, course_code, orientation, template_json) 
                    VALUES (?, 0, 0, 0, 0, 0, 0, 14, 1, ?, ?, ?, ?)");
                $ins->execute([$tName, $bImg, $dbCourseCode, $orient, $tJson]);
            }
        } catch (Exception $e) {}
    }

    public function getTemplate($courseCode) {
        $this->migrateLegacyTranscripts();
        try {
            $docType = $_GET['doc_type'] ?? 'Certificate';

            if (strtoupper($docType) === 'TRANSCRIPT') {
                $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE (course_code = ? OR course_code = ?) AND (template_name LIKE '%Transcript%' OR template_json LIKE '%Transcript%' OR course_code LIKE '%TRANSCRIPT%') ORDER BY template_id DESC LIMIT 1");
                $stmt->execute([$courseCode, $courseCode . '_TRANSCRIPT']);
                $template = $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE course_code = ? AND template_name NOT LIKE '%Transcript%' AND (template_json NOT LIKE '%Transcript%' OR template_json IS NULL) ORDER BY template_id DESC LIMIT 1");
                $stmt->execute([$courseCode]);
                $template = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Fallback if no specific cert record found
                if (!$template) {
                    $stmt = $this->pdo->prepare("SELECT * FROM certificate_template WHERE course_code = ? ORDER BY template_id ASC LIMIT 1");
                    $stmt->execute([$courseCode]);
                    $template = $stmt->fetch(PDO::FETCH_ASSOC);
                }
            }

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

                // ALSO sync to legacy transcript_templates table
                try {
                    $cStmt = $this->pdo->prepare("SELECT id FROM parent_course WHERE course_code = ? LIMIT 1");
                    $cStmt->execute([$cleanCourseCode]);
                    $cRow = $cStmt->fetch(PDO::FETCH_ASSOC);
                    $cId = $cRow['id'] ?? $cleanCourseCode;

                    $checkOld = $this->pdo->prepare("SELECT id FROM transcript_templates WHERE course_id = ? OR course_id = ? LIMIT 1");
                    $checkOld->execute([$cleanCourseCode, $cId]);
                    $oldExists = $checkOld->fetch();

                    $parsedElements = [];
                    if (isset($data->template_json)) {
                        $tj = is_string($data->template_json) ? json_decode($data->template_json, true) : (array)$data->template_json;
                        $parsedElements = $tj['elements'] ?? [];
                    }

                    $transPayloadJson = json_encode([
                        'template_name' => $templateName,
                        'pageSize' => 'A4',
                        'orientation' => $orientation,
                        'backImage' => $backImage,
                        'isActive' => $isActive === 1,
                        'elements' => $parsedElements
                    ]);

                    if ($oldExists) {
                        $upOld = $this->pdo->prepare("UPDATE transcript_templates SET template_data = ? WHERE id = ?");
                        $upOld->execute([$transPayloadJson, $oldExists['id']]);
                    } else {
                        $inOld = $this->pdo->prepare("INSERT INTO transcript_templates (course_id, template_data) VALUES (?, ?)");
                        $inOld->execute([$cId, $transPayloadJson]);
                    }
                } catch (Exception $e) {}
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
