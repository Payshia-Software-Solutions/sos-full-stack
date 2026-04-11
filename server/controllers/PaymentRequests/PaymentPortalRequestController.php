<?php
require_once './models/PaymentRequests/PaymentPortalRequest.php';

class PaymentPortalRequestController
{
    private $model;
    private $ftpConfig;
    private $pdo; // Store PDO connection

    public function __construct($pdo)
    {
        $this->pdo = $pdo; // Store PDO for database operations
        $this->model = new PaymentPortalRequest($pdo);
        $this->ftpConfig = include('./config/ftp.php');
    }

    // Get all payment requests
    public function getAllRecords()
    {
        $records = $this->model->getAllRecords();
        echo json_encode($records);
    }

    // Get a payment request by ID
    public function getRecordById($id)
    {
        $record = $this->model->getRecordById($id);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Payment request not found']);
        }
    }

    // Get a payment request by ID
    public function getRecordByUnique($unique_number)
    {
        $record = $this->model->getRecordByUnique($unique_number);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Payment request not found']);
        }
    }

    // GET a single registration by ID
    public function checkHashDupplicate($generated_hash)
    {
        $registration = $this->model->checkHashDupplicate($generated_hash);
        if ($registration) {
            echo json_encode($registration);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
        }
    }

    public function getPaymentRequestRecordsByReason($unique_number, $reason)
    {
        $records = $this->model->getPaymentRequestRecordsByReason($unique_number, $reason);
        if ($records) {
            echo json_encode($records);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No payment requests found for the given unique number and reason']);
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


    // Create a new payment request
    public function createRecord()
    {
        // Extract data from $_POST
        $data = [
            'unique_number'     => $_POST['studentNumber'] ?? null,
            'number_type'       => $_POST['number_type'] ?? null,
            'payment_reson'     => $_POST['paymentReason'] ?? null,
            'paid_amount'       => $_POST['amount'] ?? null,
            'payment_reference' => $_POST['reference'] ?? null,
            'bank'              => $_POST['bank'] ?? null,
            'branch'            => $_POST['branch'] ?? null,
            'slip_path'         => null, // FTP file path will be stored here
            'paid_date'         => date('Y-m-d'),
            'created_at'        => date('Y-m-d H:i:s'),
            'is_active'         => 1,
            'hash_value'        => null, // Image hash
        ];

        // Handle file upload
        if (!empty($_FILES['slip']['tmp_name'])) {
            $fileTmpPath = $_FILES['slip']['tmp_name'];

            // Generate SHA-256 hash of the image file
            $imageHash = hash_file('sha256', $fileTmpPath);
            $data['hash_value'] = $imageHash;

            // Check if the image already exists in the database
            // if ($this->isDuplicateImage($imageHash)) {
            //     http_response_code(409); // Conflict
            //     echo json_encode([
            //         'success' => false,
            //         'error'   => 'Duplicate image detected. The same image has already been uploaded.'
            //     ]);
            //     return;
            // }

            // File details
            $fileExtension = pathinfo($_FILES['slip']['name'], PATHINFO_EXTENSION);
            $fileName = $_POST['studentNumber'] . "-" . $_POST['paymentReason'] . "-" . uniqid() . '.' . $fileExtension;
            $localUploadPath = './uploads/' . $fileName; // Temporary local storage
            $ftpFilePath = "/payment-slips/" . $fileName; // Path on FTP

            // Ensure the local upload directory exists
            if (!is_dir('./uploads/')) {
                mkdir('./uploads/', 0777, true);
            }

            // Move the file locally first
            if (!move_uploaded_file($fileTmpPath, $localUploadPath)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'File upload failed']);
                return;
            }

            // Upload to FTP server
            if ($this->uploadToFTP($localUploadPath, $ftpFilePath)) {
                $data['slip_path'] = $ftpFilePath; // Store FTP path in database
                unlink($localUploadPath); // Remove local file after successful FTP upload
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'FTP upload failed']);
                return;
            }
        }

        // Validate data
        if ($this->validateData($data)) {
            // Insert into database
            $this->model->createRecord($data);

            // Get last inserted ID as reference number
            $reference = $this->pdo->lastInsertId();

            http_response_code(201);
            echo json_encode([
                'success'   => true,
                'message'   => 'Payment recorded successfully!',
                'reference' => (int) $reference
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error'   => 'Invalid data'
            ]);
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


    // Update a payment request
    public function updateRecord($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->validateData($data)) {
            $this->model->updateRecord($id, $data);
            echo json_encode(['message' => 'Payment request updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
        }
    }

    /**
     * Check if an image with the same hash already exists in the database
     */
    private function isDuplicateImage($imageHash)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM payment_requests WHERE hash_value = :hash_value");
        $stmt->execute(['hash_value' => $imageHash]);
        return $stmt->fetchColumn() > 0;
    }

    // Update payment status by ID
    public function updatePaymentStatus($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Check if 'payment_status' is provided in the request
        if (!isset($data['payment_status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required field: payment_status']);
            return;
        }

        // Update the payment status
        $this->model->updatePaymentStatus($id, $data['payment_status']);
        echo json_encode(['message' => 'Payment status updated successfully']);
    }

    // Delete a payment request
    public function deleteRecord($id)
    {
        $this->model->deleteRecord($id);
        echo json_encode(['message' => 'Payment request deleted successfully']);
    }

    // Data validation method
    private function validateData($data)
    {
        return isset(
            $data['unique_number'],
            $data['number_type'],
            $data['payment_reson'],
            $data['paid_amount'],
            $data['payment_reference'],
            $data['bank'],
            $data['branch'],
            $data['slip_path'],
            $data['paid_date'],
            $data['created_at'],
            $data['is_active']
        );
    }

    // Get a payment request by Ref Number and Reason
    public function getRecordByNumberType($numberType)
    {
        $record = $this->model->getRecordByNumberType($numberType);
        if ($record) {
            echo json_encode($record);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Payment request not found']);
        }
    }
}
