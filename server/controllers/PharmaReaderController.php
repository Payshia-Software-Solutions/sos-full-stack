<?php

require_once __DIR__ . '/../models/ReaderMedicine.php';
require_once __DIR__ . '/../models/ReaderAttempt.php';

class PharmaReaderController
{
    private $medicineModel;
    private $attemptModel;
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->medicineModel = new ReaderMedicine($pdo);
        $this->attemptModel = new ReaderAttempt($pdo);
    }

    public function getAllPrescriptions()
    {
        try {
            $prescriptions = $this->medicineModel->getAll();
            echo json_encode($prescriptions);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getPrescriptionById($id)
    {
        try {
            $prescription = $this->medicineModel->getById($id);
            if ($prescription) {
                echo json_encode($prescription);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Prescription not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getRandomUnansweredPrescription($userId, $difficulty, $courseCode = null)
    {
        try {
            // Check limits for this specific course
            $limit = 5; // default
            
            // Map difficulty to database column
            $colMap = ['Basic' => 'max_easy', 'Intermediate' => 'max_intermediate', 'Advanced' => 'max_advanced'];
            $col = isset($colMap[$difficulty]) ? $colMap[$difficulty] : 'max_easy';
            
            if ($courseCode) {
                $stmt = $this->pdo->prepare("SELECT {$col} as lmt FROM pharma_reader_batch_settings WHERE course_code = :course_code");
                $stmt->execute(['course_code' => $courseCode]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $limit = (int)$row['lmt'];
                }
            } else {
                // fallback to global if needed
                $settingKey = 'pharma_reader_' . $col;
                $stmt = $this->pdo->prepare("SELECT value FROM settings WHERE setting = :setting");
                $stmt->execute(['setting' => $settingKey]);
                $limitRow = $stmt->fetch(PDO::FETCH_ASSOC);
                $limit = $limitRow ? (int)$limitRow['value'] : 5;
            }

            $unanswered = $this->medicineModel->getUnanswered($userId, $difficulty, $courseCode, $limit);
            if (empty($unanswered)) {
                echo json_encode(['finished' => true, 'message' => 'No more prescriptions available for this difficulty!']);
                return;
            }
            
            // Pick a random prescription from the list
            $randomKey = array_rand($unanswered);
            $selected = $unanswered[$randomKey];
            
            echo json_encode([
                'finished' => false,
                'limit_reached' => false,
                'prescription' => $selected
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createPrescription()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['pres_name']) && isset($data['difficulty']) && isset($data['correct_answer'])) {
            try {
                $id = $this->medicineModel->create($data);
                http_response_code(201);
                echo json_encode(['id' => $id, 'message' => 'Prescription created successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function updatePrescription($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['pres_name']) && isset($data['difficulty']) && isset($data['correct_answer'])) {
            try {
                $this->medicineModel->update($id, $data);
                echo json_encode(['message' => 'Prescription updated successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function deletePrescription($id)
    {
        try {
            $this->medicineModel->delete($id);
            echo json_encode(['message' => 'Prescription deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function submitAttempt()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['pres_id']) && isset($data['user_id']) && isset($data['selected_answer'])) {
            try {
                // Fetch the prescription to validate answer
                $prescription = $this->medicineModel->getById($data['pres_id']);
                if (!$prescription) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Prescription not found']);
                    return;
                }

                // Check correctness
                $isCorrect = ($data['selected_answer'] === $prescription['correct_answer']);
                $score = $isCorrect ? 10 : 0; // 10 points for correct answer, 0 otherwise
                
                $attemptData = [
                    'pres_id' => $data['pres_id'],
                    'user_id' => $data['user_id'],
                    'difficulty' => $prescription['difficulty'],
                    'selected_answer' => $prescription[$data['selected_answer']] ?? $data['selected_answer'],
                    'score' => $score,
                    'answer_status' => $isCorrect ? 'Correct' : 'Incorrect'
                ];

                $attemptId = $this->attemptModel->create($attemptData);
                
                echo json_encode([
                    'id' => $attemptId,
                    'is_correct' => $isCorrect,
                    'score' => $score,
                    'correct_answer' => $prescription['correct_answer'],
                    'message' => $isCorrect ? 'Correct answer!' : 'Incorrect answer.'
                ]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function getUserGrades($userId)
    {
        try {
            $totalScore = $this->attemptModel->getOverallGrade($userId);
            $attempts = $this->attemptModel->getByUserId($userId);
            echo json_encode([
                'overallGrade' => $totalScore,
                'attemptsCount' => count($attempts),
                'attempts' => $attempts
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function ensureDirectoryExists($ftp_conn, $dir)
    {
        $parts = explode('/', $dir);
        $path = '';
        foreach ($parts as $part) {
            if (empty($part)) {
                continue;
            }
            $path .= '/' . $part;
            if (!@ftp_chdir($ftp_conn, $path)) {
                if (!ftp_mkdir($ftp_conn, $path)) {
                    throw new Exception("Could not create directory: $path on FTP server.");
                }
            }
        }
    }

    public function uploadImage()
    {
        if (isset($_FILES['image'])) {
            try {
                $ftpConfig = include(__DIR__ . '/../config/ftp.php');
                $ftp_server = $ftpConfig['ftp_server'];
                $ftp_username = $ftpConfig['ftp_username'];
                $ftp_password = $ftpConfig['ftp_password'];

                $uploadDirectory = '/content-provider/uploads/pharma-reader/';

                $ftpConn = ftp_connect($ftp_server);
                if (!$ftpConn) {
                    http_response_code(500);
                    echo json_encode(['error' => 'FTP connection failed']);
                    return;
                }

                $login = ftp_login($ftpConn, $ftp_username, $ftp_password);
                if (!$login) {
                    ftp_close($ftpConn);
                    http_response_code(500);
                    echo json_encode(['error' => 'FTP login failed']);
                    return;
                }

                ftp_pasv($ftpConn, true);

                // Ensure target directory exists on FTP
                try {
                    $this->ensureDirectoryExists($ftpConn, $uploadDirectory);
                } catch (Exception $e) {
                    ftp_close($ftpConn);
                    http_response_code(500);
                    echo json_encode(['error' => $e->getMessage()]);
                    return;
                }

                ftp_chdir($ftpConn, '/');

                // Generate unique filename
                $extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('pres_') . '.' . $extension;
                $remoteFilePath = $uploadDirectory . $filename;
                $tempPath = $_FILES['image']['tmp_name'];

                if (ftp_put($ftpConn, $remoteFilePath, $tempPath, FTP_BINARY)) {
                    ftp_close($ftpConn);
                    echo json_encode(['success' => true, 'filePath' => $filename]);
                } else {
                    ftp_close($ftpConn);
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to upload file to FTP']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'No image file uploaded']);
        }
    }

    public function getSettings($courseCode = null)
    {
        try {
            $settings = [
                'pharma_reader_max_easy' => 5,
                'pharma_reader_max_intermediate' => 7,
                'pharma_reader_max_advanced' => 10
            ];
            
            if ($courseCode) {
                $stmt = $this->pdo->prepare("SELECT max_easy, max_intermediate, max_advanced FROM pharma_reader_batch_settings WHERE course_code = :course_code");
                $stmt->execute(['course_code' => $courseCode]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $settings['pharma_reader_max_easy'] = (int)$row['max_easy'];
                    $settings['pharma_reader_max_intermediate'] = (int)$row['max_intermediate'];
                    $settings['pharma_reader_max_advanced'] = (int)$row['max_advanced'];
                }
            } else {
                $stmt = $this->pdo->query("SELECT setting, value FROM settings WHERE setting IN ('pharma_reader_max_easy', 'pharma_reader_max_intermediate', 'pharma_reader_max_advanced')");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $row) {
                    $settings[$row['setting']] = (int)$row['value'];
                }
            }
            echo json_encode($settings);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function saveSettings($courseCode = null)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            try {
                if ($courseCode) {
                    $stmt = $this->pdo->prepare("
                        INSERT INTO pharma_reader_batch_settings (course_code, max_easy, max_intermediate, max_advanced) 
                        VALUES (:course_code, :max_easy, :max_intermediate, :max_advanced) 
                        ON DUPLICATE KEY UPDATE 
                        max_easy = :max_easy2, 
                        max_intermediate = :max_intermediate2, 
                        max_advanced = :max_advanced2
                    ");
                    $stmt->execute([
                        'course_code' => $courseCode,
                        'max_easy' => $data['pharma_reader_max_easy'] ?? 5,
                        'max_intermediate' => $data['pharma_reader_max_intermediate'] ?? 7,
                        'max_advanced' => $data['pharma_reader_max_advanced'] ?? 10,
                        'max_easy2' => $data['pharma_reader_max_easy'] ?? 5,
                        'max_intermediate2' => $data['pharma_reader_max_intermediate'] ?? 7,
                        'max_advanced2' => $data['pharma_reader_max_advanced'] ?? 10,
                    ]);
                } else {
                    $stmt = $this->pdo->prepare("INSERT INTO settings (setting, value) VALUES (:setting, :value) ON DUPLICATE KEY UPDATE value = :value2");
                    
                    $keys = ['pharma_reader_max_easy', 'pharma_reader_max_intermediate', 'pharma_reader_max_advanced'];
                    foreach ($keys as $key) {
                        if (isset($data[$key])) {
                            $stmt->execute([
                                'setting' => $key,
                                'value' => $data[$key],
                                'value2' => $data[$key]
                            ]);
                        }
                    }
                }
                echo json_encode(['success' => true, 'message' => 'Settings saved successfully']);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function getProgress($userId, $courseCode = null)
    {
        try {
            // Fetch limits for this specific course or globally
            $limits = ['Basic' => 5, 'Intermediate' => 7, 'Advanced' => 10];
            if ($courseCode) {
                $stmt = $this->pdo->prepare("SELECT max_easy, max_intermediate, max_advanced FROM pharma_reader_batch_settings WHERE course_code = :course_code");
                $stmt->execute(['course_code' => $courseCode]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($row) {
                    $limits = [
                        'Basic' => (int)$row['max_easy'],
                        'Intermediate' => (int)$row['max_intermediate'],
                        'Advanced' => (int)$row['max_advanced']
                    ];
                }
            } else {
                $stmt = $this->pdo->query("SELECT setting, value FROM settings WHERE setting IN ('pharma_reader_max_easy', 'pharma_reader_max_intermediate', 'pharma_reader_max_advanced')");
                $settingsRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($settingsRows as $row) {
                    if ($row['setting'] === 'pharma_reader_max_easy') $limits['Basic'] = (int)$row['value'];
                    if ($row['setting'] === 'pharma_reader_max_intermediate') $limits['Intermediate'] = (int)$row['value'];
                    if ($row['setting'] === 'pharma_reader_max_advanced') $limits['Advanced'] = (int)$row['value'];
                }
            }

            // Fetch total assigned prescriptions per difficulty
            $assignedCounts = ['Basic' => 0, 'Intermediate' => 0, 'Advanced' => 0];
            if ($courseCode) {
                $stmt = $this->pdo->prepare("
                    SELECT m.difficulty, COUNT(m.id) as cnt 
                    FROM reader_medicine m 
                    JOIN pharma_reader_course_assignments ca ON m.id = ca.prescription_id 
                    WHERE ca.course_code = :course_code AND m.active_status = 'Active'
                    GROUP BY m.difficulty
                ");
                $stmt->execute(['course_code' => $courseCode]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $row) {
                    $assignedCounts[$row['difficulty']] = (int)$row['cnt'];
                }
            } else {
                $stmt = $this->pdo->query("
                    SELECT difficulty, COUNT(id) as cnt 
                    FROM reader_medicine 
                    WHERE active_status = 'Active'
                    GROUP BY difficulty
                ");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $row) {
                    $assignedCounts[$row['difficulty']] = (int)$row['cnt'];
                }
            }

            // Fetch correct attempts per prescription
            $sql = "
                SELECT m.difficulty, a.pres_id, COUNT(a.id) as correct_attempts 
                FROM reader_attempts a 
                JOIN reader_medicine m ON a.pres_id = m.id 
                WHERE a.user_id = :user_id 
                AND a.answer_status = 'Correct'
            ";
            $params = ['user_id' => $userId];
            if ($courseCode) {
                $sql .= " AND m.id IN (SELECT prescription_id FROM pharma_reader_course_assignments WHERE course_code = :course_code)";
                $params['course_code'] = $courseCode;
            }
            $sql .= " GROUP BY m.difficulty, a.pres_id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $attemptsRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate progress, capping at the limit
            $progress = [
                'Basic' => ['correct' => 0, 'required' => $assignedCounts['Basic'] * $limits['Basic']],
                'Intermediate' => ['correct' => 0, 'required' => $assignedCounts['Intermediate'] * $limits['Intermediate']],
                'Advanced' => ['correct' => 0, 'required' => $assignedCounts['Advanced'] * $limits['Advanced']]
            ];
            
            foreach ($attemptsRows as $row) {
                $diff = $row['difficulty'];
                if (isset($progress[$diff])) {
                    $cappedCorrect = min((int)$row['correct_attempts'], $limits[$diff]);
                    $progress[$diff]['correct'] += $cappedCorrect;
                }
            }
            
            echo json_encode($progress);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // ─── Course Assignment Methods ─────────────────────────────────────────────

    public function assignToCourse()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $prescriptionId = $input['prescription_id'] ?? null;
        $courseCode     = $input['course_code']     ?? null;
        $assignedBy     = $input['assigned_by']     ?? null;
        
        if (!$prescriptionId || !$courseCode) {
            echo json_encode(['status' => 'error', 'message' => 'Missing prescription_id or course_code']);
            return;
        }

        $result = $this->medicineModel->assignToCourse($prescriptionId, $courseCode, $assignedBy);
        echo json_encode($result);
    }

    public function unassignFromCourse()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $prescriptionId = $input['prescription_id'] ?? null;
        $courseCode     = $input['course_code']     ?? null;
        
        if (!$prescriptionId || !$courseCode) {
            echo json_encode(['status' => 'error', 'message' => 'Missing prescription_id or course_code']);
            return;
        }

        $result = $this->medicineModel->unassignFromCourse($prescriptionId, $courseCode);
        echo json_encode($result);
    }

    public function getAllCourseAssignments()
    {
        $assignments = $this->medicineModel->getAllCourseAssignments();
        echo json_encode(['status' => 'success', 'data' => $assignments]);
    }
}
