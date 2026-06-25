<?php

require_once __DIR__ . '/../models/ReaderMedicine.php';
require_once __DIR__ . '/../models/ReaderAttempt.php';

class PharmaReaderController
{
    private $medicineModel;
    private $attemptModel;

    public function __construct($pdo)
    {
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

    public function getRandomUnansweredPrescription($userId)
    {
        try {
            $unanswered = $this->medicineModel->getUnanswered($userId);
            if (empty($unanswered)) {
                echo json_encode(['finished' => true, 'message' => 'All prescriptions answered successfully!']);
                return;
            }
            
            // Pick a random prescription from the list
            $randomKey = array_rand($unanswered);
            $selected = $unanswered[$randomKey];
            
            echo json_encode([
                'finished' => false,
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
}
