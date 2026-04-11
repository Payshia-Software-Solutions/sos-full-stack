<?php
require_once './models/Payment/PaymentRequest.php';

class PaymentRequestController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new PaymentRequest($pdo);
        $this->ftpConfig = include('./config/ftp.php');
    }

    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    // Function to upload file via FTP with original filename
    private function uploadFileToFtp($localFilePath, $originalFileName, $userName)
    {
        $ftp_target_dir = '/content-provider/payments/payment-slips/' . $userName . '/';

        // Connect to FTP server
        $ftpCon = ftp_connect($this->ftpConfig['ftp_server'], $this->ftpConfig['ftp_port']);
        if (!$ftpCon) {
            throw new Exception("Failed to connect to FTP Server");
        }

        // Login to FTP server
        $login = ftp_login($ftpCon, $this->ftpConfig['ftp_username'], $this->ftpConfig['ftp_password']);
        if (!$login) {
            ftp_close($ftpCon);
            throw new Exception("Failed to login to FTP Server");
        }

        // Set passive mode if needed
        ftp_pasv($ftpCon, true);

        // Recursively create directories if they don't exist
        $pathParts = explode('/', trim($ftp_target_dir, '/'));
        $currentDir = '';
        foreach ($pathParts as $part) {
            $currentDir .= '/' . $part;
            if (!@ftp_chdir($ftpCon, $currentDir)) {
                if (!ftp_mkdir($ftpCon, $currentDir)) {
                    ftp_close($ftpCon);
                    throw new Exception("Failed to create directory: $currentDir");
                }
            }
        }

        // Upload the file with the original filename
        $remoteFilePath = $ftp_target_dir . $originalFileName;
        if (!ftp_put($ftpCon, $remoteFilePath, $localFilePath, FTP_BINARY)) {
            ftp_close($ftpCon);
            throw new Exception("Failed to upload file to FTP Server");
        }

        // Close FTP connection
        ftp_close($ftpCon);

        return $originalFileName;
    }

    public function createRecord()
{
    // Collect POST data
    $data = $_POST;

    // Handle file upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        // Use the original file name from POST, or default to a unique name if missing
        $originalFileName = isset($data['original_filename']) ? $data['original_filename'] : uniqid('file_') . '.tmp';
        $originalFileName = $data['created_by'] . uniqid() . '_' . $originalFileName;
        // Define a temporary local file path with the correct extension
        $tempLocalPath = $_FILES['image']['tmp_name'];
        $newLocalFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid() . '-' . $originalFileName;
      
        // Move the uploaded file to the new local path with the correct name
        if (!move_uploaded_file($tempLocalPath, $newLocalFilePath)) {
            throw new Exception("Failed to move uploaded file to a temporary location.");
        }

        try {
            // Upload to FTP server using the correct original file name
            $imagePath = $this->uploadFileToFtp($newLocalFilePath, $originalFileName, $data['created_by']);

            // Remove the local temporary file after FTP upload
            unlink($newLocalFilePath);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
            return;
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Image is required']);
        return;
    }

    // Pass data and image path to the model
    $this->model->createRecord($data, $imagePath);
    http_response_code(201);
    echo json_encode(['message' => 'Record created successfully']);
}

public function updateRecord($id)
{
    $data = $_POST;
    $imagePath = null;

    // Handle file upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $localFilePath = $_FILES['image']['tmp_name'];
        $originalFileName = $_FILES['image']['name']; // Original name with extension
        $uniqueFileName = $data['created_by'] . '_' . uniqid() . '_' . $originalFileName; // Create a unique name

        try {
            // Upload to FTP server using the unique file name
            $imagePath = $this->uploadFileToFtp($localFilePath, $uniqueFileName, $data['created_by']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
            return;
        }
    }

    // Pass the data and image path to the model for updating
    $this->model->updateRecord($id, $data, $imagePath);
    http_response_code(200);
    echo json_encode(['message' => 'Record updated successfully']);
}

    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Record deleted successfully']);
    }

    public function getRecordById($created_by)
    {
        $records = $this->model->getRecordById($created_by);
        echo json_encode($records);
    }
    public function getRecordByUserName($created_by)
    {
        $records = $this->model->getRecordByUserName($created_by);
        echo json_encode($records);
    }

    public function getStatistics()
    {
        // Fetch the statistics from the model
        $records = $this->model->getStatistics();

        // Set the appropriate content type for JSON
        header('Content-Type: application/json');

        // Send the JSON response
        echo json_encode($records);
    }

    public function getByCourseCode($courseCode)
    {
        $records = $this->model->getByCourseCode($courseCode);
        echo json_encode($records);
    }

    public function getStatisticsByCourse($courseCode)
    {
        $records = $this->model->getStatisticsByCourseCode($courseCode);
        echo json_encode($records);
    }
}