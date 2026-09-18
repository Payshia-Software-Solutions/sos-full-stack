<?php

require_once 'models/Ticket.php';

class TicketController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new Ticket($pdo);
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
    public function getById($id)
    {
        $record = $this->model->getById($id);
        echo $record ? json_encode($record) : json_encode(["error" => "Not found"]);
    }

    public function getByUsername($user_name)
    {
        echo json_encode($this->model->getByUsername($user_name));
    }

    public function create()
    {
        // Check if the request is multipart/form-data (with file upload)
        if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {

            $data = $_POST;
            $files = $_FILES['attachments'] ?? null; // Multiple files

            // Create the ticket first
            $newTicketId = $this->model->create($data);
            if (!$newTicketId) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create ticket']);
                return;
            }

            $imageUrls = []; // Array to store URLs of uploaded images

            if (!empty($files) && is_array($files['name'])) {
                // Loop through each uploaded file
                foreach ($files['name'] as $index => $fileName) {
                    $file = [
                        'name' => $files['name'][$index],
                        'type' => $files['type'][$index],
                        'tmp_name' => $files['tmp_name'][$index],
                        'error' => $files['error'][$index],
                        'size' => $files['size'][$index],
                    ];


                    // Validate image
                    $validationError = $this->validateImage($file);
                    if ($validationError) {
                        http_response_code(400);
                        echo json_encode(['error' => $validationError]);
                        return;
                    }

                    $fileTmpPath = $file['tmp_name'];

                    // Create directory structure and sanitize file name
                    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $originalFileName = pathinfo($file['name'], PATHINFO_FILENAME);
                    $sanitizedFileName = preg_replace('/[^a-zA-Z0-9\-_]/', '', $originalFileName);
                    $fileName = $sanitizedFileName . '-' . uniqid() . '.' . $fileExtension;

                    $localUploadPath = './uploads/' . $fileName;
                    $ftpFilePath = "/ticket-images/" . $fileName;

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
                        $imageUrls[] = $ftpFilePath; // Add FTP path to the array

                        // echo "Success uploading file: " . $ftpFilePath . "\n";
                        unlink($localUploadPath); // Remove local file after successful FTP upload
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => 'FTP upload failed']);
                        return;
                    }
                }

                // After all attachments are uploaded, store their URLs as a comma-separated value
                $csvImageUrls = implode(',', $imageUrls); // Create comma-separated list of file paths

                // Update the ticket with the attachments' URLs (assuming you have a column 'attachments' in your tickets table)
                $this->model->updateAttachments($newTicketId, $csvImageUrls);
            }

            echo json_encode([
                "message" => "Ticket message created",
                "ticket" => $this->model->getById($newTicketId)
            ]);
            // Handle JSON request (without file upload)
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data) {
                $newTicketId = $this->model->create($data);
                if ($newTicketId) {
                    echo json_encode([
                        "message" => "Ticket created successfully",
                        "ticket" => $this->model->getById($newTicketId)
                    ]);
                    return;
                }
            }
            http_response_code(400);
            echo json_encode(['error' => 'Invalid ticket data']);
            return;
        }
    }

    public function updateTicket($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            return;
        }

        $this->model->update($id, $data);
        $ticket = $this->model->getById($id);
        if ($ticket) {
            echo json_encode($ticket);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Ticket not found']);
        }
    }

    public function updateStatus($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['newStatus'])) {
            echo json_encode(["error" => "New status is required"]);
            return;
        }
        $newStatus = $data['newStatus'];
        $this->model->updateStatus($id, $newStatus);
        $ticket = $this->model->getById($id);
        echo json_encode(["message" => "Ticket status updated", "ticket" => $ticket]);
    }

    public function assignTicket($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        if (!isset($data['assigned_to'])) {
            echo json_encode(["error" => "Assigned to and assignee avatar are required"]);
            return;
        }

        // Default optional fields
        $isLocked = isset($data['is_locked']) ? (int)$data['is_locked'] : 0;
        $lockedBy = $data['locked_by_staff_id'] ?? null;

        // Assign ticket
        $this->model->assignTicket($id, $data['assigned_to'], 'No Avatar', $lockedBy, $isLocked);

        // Return full ticket details
        $ticket = $this->model->getById($id);
        if ($ticket) {
            echo json_encode($ticket);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Ticket not found"]);
        }
    }

    public function unlockTicket($id)
    {
        $this->model->unlockTicket($id);

        $ticket = $this->model->getById($id);
        if ($ticket) {
            echo json_encode($ticket);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Ticket not found"]);
        }
    }


    public function delete($id)
    {
        $this->model->delete($id);
        echo json_encode(["message" => "Ticket deleted"]);
    }

    public function updateRating($id)
    {
        // Check if the request is JSON
        if ($_SERVER['CONTENT_TYPE'] !== 'application/json') {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request format"]);
            return;
        }
        // Check if the ID is valid
        if (!is_numeric($id) || $id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid ticket ID"]);
            return;
        }
        // Decode the incoming JSON request body
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['rating_value'])) {
            echo json_encode(["error" => "Rating value is required"]);
            return;
        }
        $ratingValue = $data['rating_value'];
        $this->model->updateRating($id, $ratingValue);
        $ticket = $this->model->getById($id);
        echo json_encode(["message" => "Ticket rating updated", "ticket" => $ticket]);
    }


    // public function assignTicket($id)
    // {
    //     // Decode the incoming JSON request body
    //     $data = json_decode(file_get_contents("php://input"), true);

    //     // Merge the ticket ID into the data array (if not already included)
    //     $data['id'] = $id;

    //     // Assign the ticket using the model
    //     $this->model->assignToStaff($data);

    //     // Return a success response
    //     echo json_encode(["message" => "Ticket Assigned"]);
    // }
}
