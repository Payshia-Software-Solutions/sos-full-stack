<?php
require_once './models/Chats/LcAttachment.php';

class AttachmentController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new Attachment($pdo);
        $this->ftpConfig = include('./config/ftp.php'); // Load FTP configuration
    }

    public function getAttachments()
    {
        $attachments = $this->model->getAllAttachments();
        echo json_encode($attachments);
    }

    public function getAttachment($id)
    {
        $attachment = $this->model->getAttachmentById($id);
        if ($attachment) {
            echo json_encode($attachment);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Attachment not found']);
        }
    }

    public function createAttachment()
    {
        // Load FTP configuration
        $this->ftpConfig = include('./config/ftp.php');

        // Check if file and required data exist
        if (isset($_FILES['file']) && isset($_POST['chat_id']) && isset($_POST['sender_id'])) {
            $file = $_FILES['file'];
            $chatId = $_POST['chat_id'];
            $senderId = $_POST['sender_id'];

            // Prepare file details
            $fileName = basename($file['name']);
            $fileTmpPath = $file['tmp_name'];
            $uploadDirectory = '/content-provider/chat-images/' . $chatId;

            // FTP connection details
            $ftpServer = $this->ftpConfig['ftp_server'];
            $ftpUsername = $this->ftpConfig['ftp_username'];
            $ftpPassword = $this->ftpConfig['ftp_password'];

            // Generate remote file path on FTP server
            $remoteFilePath = $uploadDirectory . '/' . $fileName;

            // Connect to FTP server
            $ftpConn = ftp_connect($ftpServer);
            $login = ftp_login($ftpConn, $ftpUsername, $ftpPassword);

            if ($ftpConn && $login) {
                // Check if the upload directory exists, if not, create it
                if (!@ftp_chdir($ftpConn, $uploadDirectory)) {
                    $parts = explode('/', trim($uploadDirectory, '/'));
                    $path = '';

                    foreach ($parts as $part) {
                        $path .= '/' . $part;
                        if (!@ftp_chdir($ftpConn, $path)) {
                            if (!ftp_mkdir($ftpConn, $path)) {
                                throw new Exception('Failed to create directory: ' . $path);
                            }
                        }
                    }
                }

                // Upload the file to the FTP server
                if (ftp_put($ftpConn, $remoteFilePath, $fileTmpPath, FTP_BINARY)) {
                    ftp_close($ftpConn);
                    $fileUrl = $this->ftpConfig['base_url'] . $remoteFilePath;
                    $attachmentData = [
                        'chat_id' => $chatId,
                        'sender_id' => $senderId,
                        'file_path' => $fileUrl,
                        'file_type' => $file['type'],
                    ];

                    $this->model->createAttachment($attachmentData);
                    http_response_code(201);
                    echo json_encode(['message' => 'Attachment uploaded and saved successfully']);
                } else {
                    ftp_close($ftpConn);
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to upload file to FTP server']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to connect to FTP server']);
            }
        } else {
            // Detailed invalid input handling
            $errorDetails = [];

            if (!isset($_FILES['file'])) {
                $errorDetails[] = 'File not provided.';
            }

            if (!isset($_POST['chat_id'])) {
                $errorDetails[] = 'Chat ID not provided.';
            }

            if (!isset($_POST['sender_id'])) {
                $errorDetails[] = 'Sender ID not provided.';
            }

            http_response_code(400);
            echo json_encode(['error' => 'Invalid input', 'details' => $errorDetails]);
        }
    }



    public function updateAttachment($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['message_id']) && isset($data['file_path']) && isset($data['file_type'])) {
            $this->model->updateAttachment($id, $data);
            echo json_encode(['message' => 'Attachment updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function deleteAttachment($id)
    {
        $this->model->deleteAttachment($id);
        echo json_encode(['message' => 'Attachment deleted successfully']);
    }
}
