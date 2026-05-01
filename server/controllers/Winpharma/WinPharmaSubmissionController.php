<?php
// controllers/Winpharma/WinPharmaSubmissionController.php

require_once './models/Winpharma/WinPharmaSubmission.php';


class WinPharmaSubmissionController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new WinPharmaSubmission($pdo);
        $this->ftpConfig = include('./config/ftp.php');
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

    private function uploadSubmissionToFTP($file)
    {
        try {
            ini_set('memory_limit', '256M');

            $ftp_server = $this->ftpConfig['ftp_server'];
            $ftp_username = $this->ftpConfig['ftp_username'];
            $ftp_password = $this->ftpConfig['ftp_password'];
            $ftp_target_dir = '/content-provider/uploads/winpharma-submissions/';

            if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Invalid file upload.");
            }

            $tempDir = './tmp';
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0777, true);
            }

            $originalName = basename($file['name']);
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $filenameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);
            $newFileName = $filenameWithoutExt . '_' . time() . '_' . rand(1000, 9999) . '.' . $extension;

            $tempPath = $tempDir . '/' . $newFileName;
            if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
                throw new Exception("Failed to move uploaded file to temporary directory.");
            }

            $ftp_conn = ftp_connect($ftp_server);
            if (!$ftp_conn) {
                throw new Exception("Could not connect to FTP server.");
            }

            if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
                ftp_close($ftp_conn);
                throw new Exception("Could not login to FTP server.");
            }

            ftp_pasv($ftp_conn, true);

            $this->ensureDirectoryExists($ftp_conn, $ftp_target_dir);

            $remoteFilePath = $ftp_target_dir . $newFileName;
            if (!ftp_put($ftp_conn, $remoteFilePath, $tempPath, FTP_BINARY)) {
                throw new Exception("Failed to upload file to FTP: $remoteFilePath");
            }

            unlink($tempPath);
            ftp_close($ftp_conn);

            return ['status' => 'success', 'message' => 'File uploaded successfully.', 'path' => $newFileName];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function getWinPharmaSubmissions()
    {
        $courseCode = $_GET['courseCode'] ?? null;
        $WinPharmaSubmissions = $this->model->getAllWinPharmaSubmissions($courseCode);
        echo json_encode($WinPharmaSubmissions);
    }


    public function getWinPharmaSubmission($resource_id)
    {
        $WinPharmaSubmission = $this->model->getWinPharmaSubmissionById($resource_id);
        echo json_encode($WinPharmaSubmission);
    }

    public function GetSubmissionLevelCount($UserName, $batchCode)
    {
        $WinPharmaSubmissionCount = $this->model->GetSubmissionLevelCount($UserName, $batchCode);
        echo json_encode($WinPharmaSubmissionCount);
    }

    public function getLevels($batchCode)
    {
        $getWinpharmaLevels = $this->model->getLevels($batchCode);
        echo json_encode($getWinpharmaLevels);
    }

    public function createWinPharmaSubmission()
    {
        // 1. Try reading JSON input first
        $data = json_decode(file_get_contents('php://input'), true);

        // 2. If no JSON data, fallback to $_POST (FormData)
        if (empty($data)) {
            $data = $_POST;
        }

        // Ensure $data is an array
        if (!is_array($data)) {
            $data = [];
        }

        // 3. Handle File Upload (FormData pattern)
        $submissionPath = $data['submission'] ?? null;
        if (isset($_FILES['submission']) && $_FILES['submission']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->uploadSubmissionToFTP($_FILES['submission']);

            if ($uploadResult['status'] === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message']]);
                return;
            }

            $submissionPath = $uploadResult['path'];
        }

        // 4. Set Defaults for mandatory fields to prevent SQL errors
        $processedData = [
            'index_number'      => $data['index_number'] ?? null,
            'level_id'          => $data['level_id'] ?? 0,
            'resource_id'       => $data['resource_id'] ?? 0,
            'submission'        => $submissionPath,
            'grade'             => $data['grade'] ?? '',
            'grade_status'      => $data['grade_status'] ?? 'Pending',
            'date_time'         => $data['date_time'] ?? date('Y-m-d H:i:s'),
            'attempt'           => $data['attempt'] ?? 1,
            'course_code'       => $data['course_code'] ?? '',
            'reason'            => $data['reason'] ?? '',
            'update_by'         => null, // Set to NULL initially as per requirement
            'update_at'         => null, // Set to NULL initially
            'recorrection_count'=> $data['recorrection_count'] ?? 0,
            'payment_status'    => $data['payment_status'] ?? 'Pending'
        ];

        // 5. Basic Validation
        if (!$processedData['index_number']) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required field: index_number']);
            return;
        }

        $this->model->createWinPharmaSubmission($processedData);
        echo json_encode(['status' => 'WinPharmaSubmission created', 'path' => $submissionPath]);
    }

    public function updateWinPharmaSubmission($id)
    {
        // 1. Try reading JSON input first
        $data = json_decode(file_get_contents('php://input'), true);

        // 2. If no JSON data, fallback to $_POST (FormData)
        if (empty($data)) {
            $data = $_POST;
        }

        // 3. Handle File Upload (FormData pattern)
        if (isset($_FILES['submission']) && $_FILES['submission']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->uploadSubmissionToFTP($_FILES['submission']);

            if ($uploadResult['status'] === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message']]);
                return;
            }

            $data['submission'] = $uploadResult['path'];
        }

        // Ensure update_by and update_at are set if grading
        if (isset($data['grade']) || isset($data['grade_status'])) {
            $data['update_by'] = $data['update_by'] ?? 'System';
            $data['update_at'] = date('Y-m-d H:i:s');
        }

        $this->model->updateWinPharmaSubmission($id, $data);
        echo json_encode(['status' => 'WinPharmaSubmission updated']);
    }

    public function deleteWinPharmaSubmission($id)
    {
        $this->model->deleteWinPharmaSubmission($id);
        echo json_encode(['status' => 'WinPharmaSubmission deleted']);
    }

    // Get WinPharma Results
    public function getWinPharmaResults($UserName = null, $batchCode = null)
    {
        // Support both direct parameter passing from routes and $_GET fallback
        $UserName = $UserName ?? ($_GET['UserName'] ?? null);
        $batchCode = $batchCode ?? ($_GET['batchCode'] ?? null);

        if (!$UserName || !$batchCode) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters: UserName & batchCode']);
            return;
        }

        $results = $this->model->getWinpharmaResultsAll($UserName, $batchCode);

        echo json_encode([
            'success' => true,
            'data' => $results
        ]);
    }

    public function getWinPharmaSubmissionsByFilters($UserName = null, $batchCode = null)
    {
        // Support both direct parameter passing from routes and $_GET fallback
        $UserName = $UserName ?? ($_GET['UserName'] ?? null);
        $batchCode = $batchCode ?? ($_GET['batchCode'] ?? null);

        if (!$UserName || !$batchCode) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required parameters: UserName & batchCode']);
            return;
        }

        $submissions = $this->model->getSubmissionsByFilters($UserName, $batchCode);
        echo json_encode($submissions);
    }

    public function getGraderPerformance()
    {
        error_log("WinPharma Performance API hit for courseCode: " . ($_GET['courseCode'] ?? 'none'));
        $courseCode = $_GET['courseCode'] ?? null;

        if (!$courseCode) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Missing required parameter: courseCode'
            ]);
            return;
        }

        $performance = $this->model->getGraderPerformance($courseCode);
        $batchStats = $this->model->getBatchGradingStats($courseCode);

        echo json_encode([
            'success' => true,
            'data' => $performance,
            'stats' => $batchStats
        ]);
    }
}
