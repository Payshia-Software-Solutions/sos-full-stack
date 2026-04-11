<?php
// controllers/PackageController.php

require_once './models/Package.php';

class PackageController
{
    public $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new Package($pdo);
        $this->ftpConfig = include('./config/ftp.php'); // Load FTP configuration
    }

    // GET all packages
    public function getPackages()
    {
        $packages = $this->model->getAllPackages();
        echo json_encode($packages);
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

    private function uploadImageToFTP($file)
    {
        try {
            ini_set('memory_limit', '256M');

            // FTP configuration
            $ftp_server = $this->ftpConfig['ftp_server'];
            $ftp_username = $this->ftpConfig['ftp_username'];
            $ftp_password = $this->ftpConfig['ftp_password'];
            $ftp_target_dir = '/content-provider/uploads/package-images/';

            // Check file upload
            if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("Invalid file upload.");
            }

            // Create local temp directory
            $tempDir = './tmp';
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0777, true);
            }

            // Move uploaded file to temp folder
            $tempPath = $tempDir . '/' . basename($file['name']);
            if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
                throw new Exception("Failed to move uploaded file to temporary directory.");
            }

            // Connect to FTP
            $ftp_conn = ftp_connect($ftp_server);
            if (!$ftp_conn) {
                throw new Exception("Could not connect to FTP server.");
            }

            // Login to FTP
            if (!ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
                ftp_close($ftp_conn);
                throw new Exception("Could not login to FTP server.");
            }

            // Ensure target directory exists
            $this->ensureDirectoryExists($ftp_conn, $ftp_target_dir);

            // Upload file
            $remoteFilePath = $ftp_target_dir . basename($file['name']);
            if (!ftp_put($ftp_conn, $remoteFilePath, $tempPath, FTP_BINARY)) {
                throw new Exception("Failed to upload image to FTP: $remoteFilePath");
            }

            // Clean up
            unlink($tempPath);
            ftp_close($ftp_conn);

            return ['status' => 'success', 'message' => 'Image uploaded successfully.', 'path' => basename($file['name'])];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }



    // GET a single package by ID
    public function getPackage($package_id)
    {
        $package = $this->model->getPackageById($package_id);
        if ($package) {
            echo json_encode($package);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Package not found']);
        }
    }

    // GET packages by course IDs
    public function getPackagesByCourseIds()
    {
        // Get and sanitize query param
        $courseIdsParam = $_GET['course_ids'] ?? '';

        if (empty($courseIdsParam)) {
            http_response_code(400);
            echo json_encode(['error' => 'No course IDs provided']);
            return;
        }

        // Convert comma-separated string to array of integers
        $courseIds = array_filter(array_map('intval', explode(',', $courseIdsParam)));

        if (empty($courseIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid course ID format']);
            return;
        }

        // Call model to get packages
        $packages = $this->model->getPackagesByCourseIds($courseIds);

        echo json_encode($packages);
    }


    // POST create a new package
    public function createPackage()
    {
        // Validate required POST fields
        $requiredFields = ['package_name', 'price', 'parent_seat_count', 'garland', 'graduation_cloth', 'photo_package', 'convocation_id'];
        foreach ($requiredFields as $field) {
            if (!isset($_POST[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing required field: $field"]);
                return;
            }
        }

        // Handle file upload via FTP
        $coverImagePath = null;
        if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
            // Call the FTP upload function
            $uploadResult = $this->uploadImageToFTP($_FILES['cover_image']);

            // Check if upload was successful
            if ($uploadResult['status'] === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message']]);
                return;
            }

            // If successful, use the path returned from the FTP upload
            $coverImagePath = $uploadResult['path']; // This is the FTP path to the uploaded file
        }

        // Parse optional fields
        $courses = isset($_POST['courses']) ? $_POST['courses'] : '';
        $course_list = isset($_POST['course_list']) ? $_POST['course_list'] : '';
        $description = isset($_POST['description']) ? $_POST['description'] : '';
        $isActive = isset($_POST['is_active']) ? filter_var($_POST['is_active'], FILTER_VALIDATE_BOOLEAN) : true;

        // Call model to insert data
        $package_id = $this->model->createPackage(
            $_POST['package_name'],
            floatval($_POST['price']),
            intval($_POST['parent_seat_count']),
            intval($_POST['garland']),
            intval($_POST['graduation_cloth']),
            intval($_POST['photo_package']),
            $courses,
            $course_list,
            intval($_POST['scroll'] ?? 0),
            intval($_POST['student_seat'] ?? 0),
            intval($_POST['certificate_file'] ?? 0),
            intval($_POST['video_360'] ?? 0),
            intval($_POST['refreshments'] ?? 0),
            intval($_POST['vip_seat'] ?? 0),
            $description,
            $isActive,
            $coverImagePath, // Include the FTP image path in the DB if supported            
            intval($_POST['convocation_id']),
        );

        http_response_code(201);
        echo json_encode([
            'package_id' => $package_id,
            'message' => 'Package created successfully',
            'cover_image' => $coverImagePath
        ]);
    }


    // PUT update a package
    public function updatePackage($package_id)
    {
        // Handle file upload via FTP
        $coverImagePath = null;
        if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
            // Call the FTP upload function
            $uploadResult = $this->uploadImageToFTP($_FILES['cover_image']);

            // Check if upload was successful
            if ($uploadResult['status'] === 'error') {
                http_response_code(500);
                echo json_encode(['error' => $uploadResult['message']]);
                return;
            }

            // If successful, use the path returned from the FTP upload
            $coverImagePath = $uploadResult['path']; // This is the FTP path to the uploaded file
        }
        // Handle is_active toggle
        if (isset($_POST['is_active']) && !isset($_POST['package_name'])) {
            $isActive = $_POST['is_active'];
            if ($isActive !== "0" && $isActive !== "1") {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid value for is_active. It must be 0 or 1.']);
                return;
            }

            $success = $this->model->updatePackageStatus($package_id, intval($isActive));
            echo json_encode(
                $success
                    ? ['message' => 'Package status updated successfully']
                    : ['error' => 'Package not found or status update failed']
            );
            return;
        }

        // Check required fields
        $required = ['package_name', 'price', 'parent_seat_count', 'garland', 'graduation_cloth', 'photo_package'];
        foreach ($required as $field) {
            if (!isset($_POST[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing required field: $field"]);
                return;
            }
        }

        $success = $this->model->updatePackage(
            $package_id,
            $_POST['package_name'],
            floatval($_POST['price']),
            intval($_POST['parent_seat_count']),
            intval($_POST['garland']),
            intval($_POST['graduation_cloth']),
            intval($_POST['photo_package']),
            $_POST['courses'] ?? '',
            $_POST['course_list'] ?? '',
            intval($_POST['scroll'] ?? 0),
            intval($_POST['student_seat'] ?? 0),
            intval($_POST['certificate_file'] ?? 0),
            intval($_POST['video_360'] ?? 0),
            intval($_POST['refreshments'] ?? 0),
            intval($_POST['vip_seat'] ?? 0),
            $_POST['description'] ?? '',
            isset($_POST['is_active']) ? filter_var($_POST['is_active'], FILTER_VALIDATE_BOOLEAN) : true,
            $coverImagePath, // new image path if updated
            intval($_POST['convocation_id'])
        );

        echo json_encode(
            $success
                ? ['message' => 'Package updated successfully']
                : ['error' => 'Package not found or update failed']
        );
    }


    // DELETE a package
    public function deletePackage($package_id)
    {
        $success = $this->model->deletePackage($package_id);
        if ($success) {
            echo json_encode(['message' => 'Package deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Package not found or deletion failed']);
        }
    }
}
