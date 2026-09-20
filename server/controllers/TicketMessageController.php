<?php

require_once 'models/TicketMessage.php';

class TicketMessageController
{
    private $model;
    private $ftpConfig;
    public function __construct($pdo)

    {
        $this->model = new TicketMessage($pdo);
        $this->ftpConfig = include('./config/ftp.php');
    }

    // FTP Helper Methods (copied from ConvocationRegistrationController)
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
        ini_set('memory_limit', '256M'); // Increase memory limit for image processing

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
            error_log("Directory creation failed: " . $e->getMessage());
            ftp_close($ftp_conn);
            return false;
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

    // Validate image file
    private function validateImage($file)
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowedTypes)) {
            return 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
        }

        if ($file['size'] > $maxSize) {
            return 'File size too large. Maximum 5MB allowed.';
        }

        return null; // No errors
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }


    public function getByTicketId($ticketId)
    {
        echo json_encode($this->model->getByTicketId($ticketId));
    }
    // public function create()
    // {
    //     $data = json_decode(file_get_contents("php://input"), true);
    //     $this->model->create($data);
    //     echo json_encode(["message" => "Message added"]);
    // }


    public function create()
    {
        if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
            $data = $_POST;
            $files = $_FILES['attachments'] ?? null;

            $newMessageId = null;
            if (isset($data['text']) && $data['text'] !== '') {
                // Create a new message with text
                $newMessageId = $this->model->create($data);
            }

            // var_dump($data);

            if ($newMessageId) {
                $newMessageIds[] = $newMessageId;
            } else {
                // http_response_code(500);
                // echo json_encode(['error' => 'Failed to create image message']);
                // return;
            }

            if (!empty($files)) {
                $fileCount = count($files['name']);
                $uploadedImagePaths = [];
                $newMessageIds = [];

                if (!is_dir('./uploads/')) {
                    mkdir('./uploads/', 0777, true);
                }

                for ($i = 0; $i < $fileCount; $i++) {
                    if ($files['error'][$i] === UPLOAD_ERR_OK) {
                        $tmpName = $files['tmp_name'][$i];
                        $fileName = $files['name'][$i];

                        $fileInfo = [
                            'name' => $fileName,
                            'tmp_name' => $tmpName,
                            'type' => $files['type'][$i],
                            'size' => $files['size'][$i]
                        ];

                        $validationError = $this->validateImage($fileInfo);
                        if ($validationError) {
                            http_response_code(400);
                            echo json_encode(['error' => $validationError]);
                            return;
                        }

                        $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                        $baseName = preg_replace('/[^a-zA-Z0-9\-_]/', '', pathinfo($fileName, PATHINFO_FILENAME));
                        $newFileName = $baseName . '-' . uniqid() . '.' . $ext;

                        $localPath = './uploads/' . $newFileName;
                        $ftpPath = "/message-images/" . $newFileName;

                        if (move_uploaded_file($tmpName, $localPath)) {
                            if ($this->uploadToFTP($localPath, $ftpPath)) {
                                unlink($localPath); // Remove local file after successful FTP upload
                                $uploadedImagePaths[] = $ftpPath;

                                // Create a new message with this image path
                                $messageData = [
                                    'ticket_id' => $data['ticket_id'],
                                    'from_role' => $data['from_role'],
                                    'text' => '', // Image-only message
                                    'time' => $data['time'],
                                    'img_url' => $ftpPath,
                                    'created_by' => $data['created_by']
                                ];

                                $newMessageId = $this->model->create($messageData);
                                if ($newMessageId) {
                                    $newMessageIds[] = $newMessageId;
                                } else {
                                    http_response_code(500);
                                    echo json_encode(['error' => 'Failed to create image message']);
                                    return;
                                }
                            } else {
                                http_response_code(500);
                                echo json_encode(['error' => 'FTP upload failed']);
                                return;
                            }
                        } else {
                            http_response_code(400);
                            echo json_encode(['error' => 'Failed to move uploaded file']);
                            return;
                        }
                    }
                }

                echo json_encode([
                    "message" => "Image messages added",
                    "image_paths" => $uploadedImagePaths,
                    "message_ids" => $newMessageIds
                ]);
            } else {
                // No files uploaded, return 200 with the appropriate message
                http_response_code(200);
                echo json_encode([
                    "message" => "Messages added"
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported content type']);
        }
    }





    public function delete($id)
    {
        $this->model->delete($id);
        echo json_encode(["message" => "Message deleted"]);
    }

    public function updateReadStatus($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['read_status'])) {
            echo json_encode(["error" => "Read status is required"]);
            return;
        }
        $readStatus = $data['read_status'];
        $this->model->updateReadStatus($id, $readStatus);
        echo json_encode(["message" => "Message read status updated"]);
    }

    public function getUnreadMessages($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['read_status'])) {
            echo json_encode(["error" => "Read status is required"]);
            return;
        }
        $readStatus = $data['read_status'];
        if (!isset($data['from_role'])) {
            echo json_encode(["error" => "From role is required"]);
            return;
        }
        $fromRole = $data['from_role'];
        $unreadMessages = $this->model->getUnreadMessages($id, $readStatus, $fromRole);
        echo json_encode($unreadMessages);
    }
}
