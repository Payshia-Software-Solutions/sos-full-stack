<?php
// controllers/WordListController.php

require_once './models/WordList.php';

class WordListController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new WordList($pdo);
        $this->ftpConfig = include('./config/ftp.php');
    }

    // GET all words
    public function getWords()
    {
        echo json_encode($this->model->getAllWords());
    }

    // GET single word
    public function getWord($id)
    {
        $word = $this->model->getWordById($id);
        if ($word) {
            echo json_encode($word);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Word not found']);
        }
    }

    // GET single word for Game
    public function getWordForGame($studentNumber)
    {
        $word = $this->model->getWordForGame($studentNumber);
        if ($word) {
            echo json_encode($word);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Word not found']);
        }
    }


    // POST create new word
    public function createWord()
    {
        $data = $_POST;
        $file = $_FILES['word_file'] ?? null;
        $required = ['word_name', 'word_tip', 'word_type', 'word_status', 'created_by'];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing field: $field"]);
                return;
            }
        }

        $created_at = date('Y-m-d H:i:s');

        if (!empty($file) && $file['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $file['tmp_name'];

            // File details
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = uniqid() . '.' . $fileExtension;
            $localUploadPath = './uploads/' . $fileName; // Temporary local storage
            $ftpFilePath = "/word-pallet/" . $fileName; // Path on FTP server

            // Ensure the local upload directory exists
            if (!is_dir('./uploads/')) {
                mkdir('./uploads/', 0777, true);
            }

            // Move the file locally first
            if (!move_uploaded_file($fileTmpPath, $localUploadPath)) {
                http_response_code(400);
                echo json_encode(['error' => 'File upload failed']);
                return;
            }

            // Upload to FTP server
            if ($this->uploadToFTP($localUploadPath, $ftpFilePath)) {
                $wordImagePath = $ftpFilePath; // Store FTP path
                unlink($localUploadPath); // Remove local file after successful FTP upload
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'FTP upload failed']);
                return;
            }
        }


        $id = $this->model->createWord(
            $data['word_name'],
            $data['word_tip'],
            $wordImagePath,
            $data['word_type'],
            $data['word_status'],
            $data['created_by'],
            $created_at
        );

        http_response_code(201);
        echo json_encode(['id' => $id, 'message' => 'Word created successfully', 'status' => 'success']);
    }

    // PUT update word
    public function updateWord($id)
    {
        $data = $_POST;
        $file = $_FILES['word_file'] ?? null;

        // Fetch current word data
        $currentWord = $this->model->getWordById($id);
        if (!$currentWord) {
            http_response_code(404);
            echo json_encode(['error' => 'Word not found']);
            return;
        }
        $required = ['word_name', 'word_tip', 'word_type', 'word_status', 'created_by'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing field: $field"]);
                return;
            }
        }

        $updated_at = date('Y-m-d H:i:s');
        $wordImagePath = $currentWord['word_img']; // Default to old path

        // Handle new image upload if exists
        if (!empty($file) && $file['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $file['tmp_name'];
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = uniqid() . '.' . $fileExtension;
            $localUploadPath = './uploads/' . $fileName;
            $ftpFilePath = "/word-pallet/" . $fileName;

            if (!is_dir('./uploads/')) {
                mkdir('./uploads/', 0777, true);
            }

            if (!move_uploaded_file($fileTmpPath, $localUploadPath)) {
                http_response_code(400);
                echo json_encode(['error' => 'File upload failed']);
                return;
            }

            if ($this->uploadToFTP($localUploadPath, $ftpFilePath)) {
                $wordImagePath = $ftpFilePath;
                unlink($localUploadPath);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'FTP upload failed']);
                return;
            }
        }

        $success = $this->model->updateWord(
            $id,
            $data['word_name'],
            $data['word_tip'],
            $wordImagePath,
            $data['word_type'],
            $data['word_status'],
            $data['created_by'],
            $updated_at
        );

        if ($success) {
            http_response_code(200);
            echo json_encode(['message' => 'Word updated successfully', 'status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Update failed']);
        }
    }


    // DELETE a word
    public function deleteWord($id)
    {
        $success = $this->model->deleteWord($id);
        if ($success) {
            echo json_encode(['message' => 'Word deleted successfully', 'status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Delete failed']);
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

    private function uploadToFTP($localFile, $ftpFilePath)
    {
        ini_set('memory_limit', '256M'); // Increase to 256 MB or higher if needed
        // FTP credentials from config
        $ftp_server   = $this->ftpConfig['ftp_server'];
        $ftp_username = $this->ftpConfig['ftp_username'];
        $ftp_password = $this->ftpConfig['ftp_password'];

        // Connect to FTP server
        $ftp_conn = ftp_connect($ftp_server);
        if (!$ftp_conn) {
            error_log("FTP connection failed: $ftp_server");
            return false;
        }

        // Login to FTP
        if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
            ftp_close($ftp_conn);
            error_log("FTP login failed for user: $ftp_username");
            return false;
        }

        // Enable passive mode
        ftp_pasv($ftp_conn, true);


        // Ensure that the target directory exists
        try {
            $this->ensureDirectoryExists($ftp_conn, dirname($ftpFilePath));
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            ftp_close($ftp_conn);
            return;
        }

        // Upload file
        if (!ftp_put($ftp_conn, $ftpFilePath, $localFile, FTP_BINARY)) {
            ftp_close($ftp_conn);
            error_log("Failed to upload: $localFile to $ftpFilePath");
            return false;
        }

        // Close FTP connection
        ftp_close($ftp_conn);
        return true;
    }
}
