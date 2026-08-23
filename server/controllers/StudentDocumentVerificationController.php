<?php
require_once './models/StudentDocumentVerification.php';

class StudentDocumentVerificationController
{
    private $model;
    private $pdo;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->model = new StudentDocumentVerification($pdo);
        if (file_exists('./config/ftp.php')) {
            $this->ftpConfig = include('./config/ftp.php');
        }
    }

    // Get student KYC verification status by student username/ID
    public function getStatusByStudent($studentId)
    {
        $studentId = rtrim(trim($studentId), '/');
        $record = $this->model->getByStudentId($studentId);
        if ($record) {
            echo json_encode([
                'success' => true,
                'data' => $record
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'data' => [
                    'student_id' => $studentId,
                    'status' => 'not_submitted',
                    'rejection_reason' => null
                ]
            ]);
        }
    }

    // Submit or re-submit verification documents
    public function submitDocuments()
    {
        $studentId = $_POST['student_id'] ?? null;
        $idType = $_POST['id_type'] ?? 'nic';
        $idNumber = $_POST['id_number'] ?? null;
        $otherDocs = $_POST['other_documents'] ?? null;

        if (!$studentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Student ID is required']);
            return;
        }

        // Check if student already has a pending or approved request
        $existing = $this->model->getByStudentId($studentId);
        if ($existing) {
            if ($existing['status'] === 'pending') {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Your document verification is already under review. You cannot submit again until an administrator verifies it.'
                ]);
                return;
            }
            if ($existing['status'] === 'approved') {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Your documents have already been verified and approved.'
                ]);
                return;
            }
        }

        $uploadDir = './uploads/student-documents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $data = [
            'student_id' => $studentId,
            'id_type' => $idType,
            'id_number' => $idNumber,
            'other_documents' => $otherDocs
        ];

        $documentFields = [
            'id_front_image' => 'id_front',
            'id_back_image' => 'id_back',
            'birth_certificate_front' => 'bc_front',
            'birth_certificate_back' => 'bc_back',
            'ol_certificate' => 'ol_cert',
            'al_certificate' => 'al_cert'
        ];

        foreach ($documentFields as $dbColumn => $fileKey) {
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                $fileTmp = $_FILES[$fileKey]['tmp_name'];
                $ext = pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION);
                $cleanStudentId = preg_replace('/[^a-zA-Z0-9_-]/', '_', $studentId);
                $fileName = $cleanStudentId . '_' . $fileKey . '_' . uniqid() . '.' . $ext;
                $localPath = $uploadDir . $fileName;

                if (move_uploaded_file($fileTmp, $localPath)) {
                    $ftpFilePath = '/student-documents/' . $fileName;
                    if ($this->uploadToFTP($localPath, $ftpFilePath)) {
                        $data[$dbColumn] = $ftpFilePath;
                        @unlink($localPath); // Remove temporary local file after successful FTP transfer
                    } else {
                        // Fallback to local server path if FTP is offline
                        $data[$dbColumn] = '/uploads/student-documents/' . $fileName;
                    }
                }
            }
        }

        $id = $this->model->createOrUpdateRecord($data);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Documents submitted successfully for verification',
            'id' => $id
        ]);
    }

    // Admin: Get all student document verification records
    public function getAllRecords()
    {
        $status = $_GET['status'] ?? null;
        $search = $_GET['search'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;

        $records = $this->model->getAll($status, $search, $limit, $offset);
        $total = $this->model->countAll($status, $search);

        echo json_encode([
            'success' => true,
            'data' => $records,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit)
            ]
        ]);
    }

    // Admin: Get single document verification record
    public function getRecordById($id)
    {
        $record = $this->model->getById($id);
        if ($record) {
            echo json_encode(['success' => true, 'data' => $record]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Verification record not found']);
        }
    }

    // Admin: Verify (Approve / Reject) record
    public function verifyRecord($id)
    {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?? $_POST;

        $status = $input['status'] ?? null;
        $rejectionReason = $input['rejection_reason'] ?? null;
        $verifiedBy = $input['verified_by'] ?? 'Admin';

        if (!in_array($status, ['approved', 'rejected', 'pending'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status provided']);
            return;
        }

        if ($status === 'rejected' && empty($rejectionReason)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Rejection reason is required when rejecting verification']);
            return;
        }

        $result = $this->model->updateStatus($id, $status, $rejectionReason, $verifiedBy);

        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Document verification status updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update verification status']);
        }
    }

    // Admin: Set user verification status directly in users table
    public function updateUserVerificationStatus($username)
    {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?? $_POST;
        $status = $input['verification_status'] ?? null;

        if (!in_array($status, ['Unverified', 'Pending', 'Verified', 'Rejected'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid verification status value']);
            return;
        }

        $result = $this->model->setUserVerificationStatus($username, $status);
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'User verification status updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update user verification status']);
        }
    }

    private function uploadToFTP($localFile, $ftpFilePath)
    {
        if (empty($this->ftpConfig) || empty($this->ftpConfig['ftp_server'])) {
            return false;
        }

        $ftpServer   = $this->ftpConfig['ftp_server'];
        $ftpUsername = $this->ftpConfig['ftp_username'];
        $ftpPassword = $this->ftpConfig['ftp_password'];
        $ftpPort     = $this->ftpConfig['ftp_port'] ?? 21;

        $connId = @ftp_connect($ftpServer, $ftpPort);
        if (!$connId) {
            error_log("FTP connection failed: $ftpServer");
            return false;
        }

        $loginResult = @ftp_login($connId, $ftpUsername, $ftpPassword);
        if (!$loginResult) {
            @ftp_close($connId);
            error_log("FTP login failed for user: $ftpUsername");
            return false;
        }

        ftp_pasv($connId, true);

        // Ensure remote directory exists
        $dir = dirname($ftpFilePath);
        $parts = explode('/', trim($dir, '/'));
        $currentDir = '';
        foreach ($parts as $part) {
            if (empty($part)) continue;
            $currentDir .= '/' . $part;
            if (!@ftp_chdir($connId, $currentDir)) {
                @ftp_mkdir($connId, $currentDir);
            }
        }

        $upload = @ftp_put($connId, $ftpFilePath, $localFile, FTP_BINARY);
        @ftp_close($connId);

        return $upload;
    }
}
