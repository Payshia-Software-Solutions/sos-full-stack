<?php

class CourseContentUploadController
{
    private $ftpConfig;

    public function __construct()
    {
        $this->ftpConfig = require './config/ftp.php';
    }

    private function ensureDirectoryExists($ftp_conn, $dir)
    {
        $dirArray = explode('/', trim($dir, '/'));
        $path = '';

        foreach ($dirArray as $directory) {
            $path .= '/' . $directory;
            if (!@ftp_chdir($ftp_conn, $path)) {
                if (!ftp_mkdir($ftp_conn, $path)) {
                    return false;
                }
            }
        }
        return true;
    }

    public function uploadFile()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded or upload error occurred']);
            return;
        }

        $file = $_FILES['file'];
        $tempPath = $file['tmp_name'];
        $originalName = basename($file['name']);
        
        // Allowed extensions
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($ext, ['mp4', 'pdf'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Only MP4 and PDF files are allowed']);
            return;
        }

        // Generate unique filename to prevent overwrites
        $filename = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.\-_]/", "", $originalName);
        
        $ftp_server = $this->ftpConfig['ftp_server'];
        $ftp_username = $this->ftpConfig['ftp_username'];
        $ftp_password = $this->ftpConfig['ftp_password'];
        
        // Determine subfolder based on extension to keep things organized
        $subfolder = $ext === 'mp4' ? 'videos' : 'documents';
        $ftp_target_dir = '/content-provider/uploads/course_content/' . $subfolder . '/';

        try {
            $ftp_conn = ftp_connect($ftp_server);
            if (!$ftp_conn) {
                throw new Exception("Could not connect to FTP server.");
            }

            if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
                ftp_close($ftp_conn);
                throw new Exception("FTP authentication failed.");
            }

            ftp_pasv($ftp_conn, true);

            if (!$this->ensureDirectoryExists($ftp_conn, $ftp_target_dir)) {
                ftp_close($ftp_conn);
                throw new Exception("Failed to create destination directory on FTP server.");
            }

            ftp_chdir($ftp_conn, '/');

            $remoteFilePath = $ftp_target_dir . $filename;
            if (!ftp_put($ftp_conn, $remoteFilePath, $tempPath, FTP_BINARY)) {
                ftp_close($ftp_conn);
                throw new Exception("File upload to FTP failed.");
            }

            ftp_close($ftp_conn);

            // Return relative path to be used by frontend
            $relativePath = 'uploads/course_content/' . $subfolder . '/' . $filename;
            
            echo json_encode([
                'success' => true,
                'filePath' => $relativePath
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
