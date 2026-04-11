<?php
// controllers/Winpharma/WinPharmaLevelResourceController.php

require_once './models/Winpharma/WinPharmaLevelResource.php';

class WinPharmaLevelResourceController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new WinPharmaLevelResource($pdo);
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

    private function uploadTaskCoverToFTP($file)
    {
        try {
            ini_set('memory_limit', '256M');

            $ftp_server = $this->ftpConfig['ftp_server'];
            $ftp_username = $this->ftpConfig['ftp_username'];
            $ftp_password = $this->ftpConfig['ftp_password'];
            $ftp_port = $this->ftpConfig['ftp_port'] ?? 21;

            $ftp_target_dir = '/content-provider/uploads/winpharma-task-covers/';

            if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Invalid file upload.");
            }

            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $filename = uniqid('winpharma_cover_', true) . ($ext ? ('.' . $ext) : '');

            $tempDir = './tmp';
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0777, true);
            }

            $tempPath = $tempDir . '/' . $filename;
            if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
                throw new Exception("Failed to move uploaded file to temporary directory.");
            }

            $ftp_conn = ftp_connect($ftp_server, $ftp_port);
            if (!$ftp_conn) {
                throw new Exception("Could not connect to FTP server.");
            }

            if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
                ftp_close($ftp_conn);
                throw new Exception("Could not login to FTP server.");
            }

            ftp_pasv($ftp_conn, true);

            $this->ensureDirectoryExists($ftp_conn, $ftp_target_dir);

            $remoteFilePath = $ftp_target_dir . $filename;
            if (!ftp_put($ftp_conn, $remoteFilePath, $tempPath, FTP_BINARY)) {
                throw new Exception("Failed to upload file to FTP: $remoteFilePath");
            }

            unlink($tempPath);
            ftp_close($ftp_conn);

            // Stored as a content-provider relative path so the client can do `${CONTENT_PROVIDER_BASE_URL}/${task_cover}`.
            $publicPath = ltrim($ftp_target_dir, '/'); // content-provider/uploads/...
            return ['status' => 'success', 'path' => $publicPath . $filename];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function readRequestData()
    {
        $input = file_get_contents('php://input');
        $data = !empty($input) ? json_decode($input, true) : null;

        if (is_array($data)) {
            return $data;
        }

        if (!empty($_POST)) {
            return $_POST;
        }

        return [];
    }

    public function getWinPharmaLevelResources()
    {
        $WinPharmaLevelResources = $this->model->getAllWinPharmaLevelResources();
        echo json_encode($WinPharmaLevelResources);
    }

    public function getWinPharmaLevelResource($id)
    {
        $WinPharmaLevelResource = $this->model->getWinPharmaLevelResourceById($id);
        echo json_encode($WinPharmaLevelResource);
    }
    
    public function createWinPharmaLevelResource()
    {
        $data = $this->readRequestData();

        if (isset($_FILES['task_cover']) && $_FILES['task_cover']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->uploadTaskCoverToFTP($_FILES['task_cover']);
            if (($uploadResult['status'] ?? '') === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message'] ?? 'Cover upload failed']);
                return;
            }
            $data['task_cover'] = $uploadResult['path'];
        }

        $processedData = [
            'level_id' => isset($data['level_id']) && $data['level_id'] !== '' ? $data['level_id'] : null,
            'resource_title' => isset($data['resource_title']) && $data['resource_title'] !== '' ? $data['resource_title'] : null,
            'resource_data' => $data['resource_data'] ?? '',
            'created_by' => $data['created_by'] ?? 'System',
            'task_cover' => $data['task_cover'] ?? null,
            'video_url' => $data['video_url'] ?? null,
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
        ];

        if (is_null($processedData['level_id']) || is_null($processedData['resource_title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: level_id, resource_title']);
            return;
        }

        $this->model->createWinPharmaLevelResource($processedData);
        http_response_code(201);
        echo json_encode(['status' => 'WinPharmaLevelResource created', 'task_cover' => $processedData['task_cover']]);
    }

    public function updateWinPharmaLevelResource($id)
    {
        $existing = $this->model->getWinPharmaLevelResourceById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
            return;
        }

        $data = $this->readRequestData();

        if (isset($_FILES['task_cover']) && $_FILES['task_cover']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->uploadTaskCoverToFTP($_FILES['task_cover']);
            if (($uploadResult['status'] ?? '') === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message'] ?? 'Cover upload failed']);
                return;
            }
            $data['task_cover'] = $uploadResult['path'];
        }

        $processedData = [
            'level_id' => $data['level_id'] ?? $existing['level_id'],
            'resource_title' => $data['resource_title'] ?? $existing['resource_title'],
            'resource_data' => array_key_exists('resource_data', $data) ? $data['resource_data'] : $existing['resource_data'],
            'created_by' => $data['created_by'] ?? $existing['created_by'],
            'task_cover' => array_key_exists('task_cover', $data) ? $data['task_cover'] : ($existing['task_cover'] ?? null),
            'video_url' => array_key_exists('video_url', $data) ? $data['video_url'] : ($existing['video_url'] ?? null),
            'is_active' => array_key_exists('is_active', $data) ? (int)$data['is_active'] : (int)$existing['is_active'],
        ];

        $this->model->updateWinPharmaLevelResource($id, $processedData);
        echo json_encode(['status' => 'WinPharmaLevelResource updated', 'task_cover' => $processedData['task_cover']]);
    }

    public function deleteWinPharmaLevelResource($id)
    {
        $this->model->deleteWinPharmaLevelResource($id);
        echo json_encode(['status' => 'WinPharmaLevelResource deleted']);
    }

    public function getWinPharmaLevelResourcesByLevel($id)
    {
        $resources = $this->model->getWinPharmaLevelResourcesByLevel($id);
        echo json_encode($resources);
    }
}
