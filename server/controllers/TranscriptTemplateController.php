<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class TranscriptTemplateController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    private function ensureTableExists() {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS `transcript_templates` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `course_id` VARCHAR(100) NOT NULL,
              `template_data` LONGTEXT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY `course_id_unique` (`course_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            $this->pdo->exec($sql);
        } catch (Exception $e) {
            // Silence if created
        }
    }

    public function getTemplate($courseId) {
        $this->ensureTableExists();
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM transcript_templates WHERE course_id = ?");
            $stmt->execute([$courseId]);
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
        $this->ensureTableExists();
        $data = json_decode(file_get_contents("php://input"));
        $courseId = $data->course_id ?? null;
        $templateData = $data->template_data ?? null;

        if (!$courseId || !$templateData) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing course_id or template_data']);
            return;
        }

        try {
            // Check if exists
            $stmt = $this->pdo->prepare("SELECT id FROM transcript_templates WHERE course_id = ?");
            $stmt->execute([$courseId]);
            $exists = $stmt->fetch();

            if ($exists) {
                $updateStmt = $this->pdo->prepare("UPDATE transcript_templates SET template_data = ? WHERE course_id = ?");
                $updateStmt->execute([json_encode($templateData), $courseId]);
            } else {
                $insertStmt = $this->pdo->prepare("INSERT INTO transcript_templates (course_id, template_data) VALUES (?, ?)");
                $insertStmt->execute([$courseId, json_encode($templateData)]);
            }

            echo json_encode(['success' => true, 'message' => 'Template saved successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function printTranscript($courseId, $studentNumber) {
        // Here we will generate PDF
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM transcript_templates WHERE course_id = ?");
            $stmt->execute([$courseId]);
            $template = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$template) {
                http_response_code(404);
                echo "Transcript template not found for this course.";
                return;
            }

            $templateData = json_decode($template['template_data'], true);
            $html = $templateData['html'] ?? '<h1>Empty Template</h1>';

            // We need to fetch student data and replace placeholders in HTML
            // E.g., {{STUDENT_NAME}}
            // For now, let's just create a basic placeholder replacement
            $studentStmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
            $studentStmt->execute([$studentNumber]);
            $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

            if ($student) {
                $html = str_replace('{{STUDENT_NAME}}', $student['first_name'] . ' ' . $student['last_name'], $html);
                $html = str_replace('{{STUDENT_ID}}', $student['username'], $html);
            }

            // Generate PDF
            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            
            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $dompdf->stream("Transcript_{$studentNumber}.pdf", ["Attachment" => false]);
            exit;

        } catch (PDOException $e) {
            http_response_code(500);
            echo "Error generating PDF: " . $e->getMessage();
        }
    }
}
