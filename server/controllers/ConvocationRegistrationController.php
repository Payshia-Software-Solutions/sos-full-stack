<?php
// controllers/ConvocationRegistrationController.php

require_once __DIR__ . '/../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;
use chillerlan\QRCode\QRCode;

define('PARENT_SEAT_RATE', 750);

require_once './models/ConvocationRegistration.php';
require_once './models/Convocation.php';
require_once './models/ConvocationStudentInfo.php';
require_once './controllers/TransactionPaymentController.php';
require_once './controllers/UserFullDetailsController.php';
require_once './controllers/CertificationCenter/CcEvaluationController.php';
require_once './controllers/PackageController.php';
require_once './models/SMSModel.php';

class ConvocationRegistrationController
{
    public $model;
    private $pdo;
    private $ftpConfig;
    private $transactionPaymentController;
    private $userFullDetailsController;
    private $packageController;
    private $smsModel;
    private $convocationTemplatePath;
    private $CcEvaluationController;
    private $convocationModel;
    private $convocationStudentInfoModel;

    public function __construct($pdo, $convocationTemplatePath)
    {
        $this->pdo = $pdo;
        $this->model = new ConvocationRegistration($pdo);
        $this->convocationModel = new Convocation($pdo);
        $this->convocationStudentInfoModel = new ConvocationStudentInfo($pdo);
        $this->convocationTemplatePath = $convocationTemplatePath;
        $this->ftpConfig = include('./config/ftp.php');
        $this->transactionPaymentController = new TransactionPaymentController($pdo);
        $this->userFullDetailsController = new UserFullDetailsController($pdo);
        $this->packageController = new PackageController($pdo);
        $this->CcEvaluationController = new CcEvaluationController($pdo);
        $this->smsModel = new SMSModel($_ENV['SMS_AUTH_TOKEN'], $_ENV['SMS_SENDER_ID'], $convocationTemplatePath);
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
    // GET all registrations
    public function getRegistrations()
    {
        $registrations = $this->model->getAllRegistrations();
        echo json_encode($registrations);
    }

    public function getCountsBySessions($ceremonyId)
    {
        $registrations = $this->model->getCountsBySessions($ceremonyId);
        echo json_encode($registrations);
    }


    public function getAdditionalSeatsCountsBySessions($sessionId, $ceremonyId)
    {
        $registrations = $this->model->getAdditionalSeatsCountsBySessions($sessionId, $ceremonyId);
        echo json_encode($registrations);
    }
    // GET a single registration by ID
    public function getRegistration($registration_id)
    {
        $registration = $this->model->getRegistrationById($registration_id);
        if ($registration) {
            echo json_encode($registration);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
        }
    }

    // GET a single registration by student number (alphanumeric)
    public function getRegistrationByStudentNumber($student_number)
    {
        $registration = $this->model->getRegistrationByStudentNumber($student_number);
        if ($registration) {
            echo json_encode($registration);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
        }
    }


    // GET a single registration by ID
    public function validateDuplicate($student_number)
    {
        $registration = $this->model->validateDuplicate($student_number);
        if ($registration) {
            echo json_encode($registration);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
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


    // GET a single registration by reference number
    public function getRegistrationByReference($reference_number)
    {
        $registration = $this->model->getRegistrationByReference($reference_number);
        if ($registration) {
            echo json_encode($registration);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
        }
    }

    /**
     * Expand course identifiers (course.id, course.parent_course_id, course.course_code)
     * so that the same course is matched whichever form the booking or order stored.
     */
    private function expandCourseTokens(array $tokens)
    {
        $tokens = array_values(array_unique(array_filter(array_map(fn($t) => trim((string)$t), $tokens), fn($t) => $t !== '')));
        if (empty($tokens)) return [];

        $expanded = $tokens;
        $in = implode(',', array_fill(0, count($tokens), '?'));
        $stmt = $this->pdo->prepare("
            SELECT id, parent_course_id, course_code
            FROM course
            WHERE id IN ($in) OR course_code IN ($in)
        ");
        $stmt->execute(array_merge($tokens, $tokens));
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            foreach (['id', 'parent_course_id', 'course_code'] as $k) {
                if (!empty($row[$k])) $expanded[] = trim((string)$row[$k]);
            }
        }
        return array_values(array_unique($expanded));
    }

    /**
     * Returns a conflict description if any requested course is already in an active
     * convocation booking (any ceremony) or has a certificate order that is not cancelled
     * (pending, printed, dispatched by courier, or delivered).
     */
    private function findCourseConflict($studentNumber, array $requestedIds)
    {
        $bookStmt = $this->pdo->prepare("
            SELECT reference_number, course_id
            FROM convocation_registrations
            WHERE student_number = ? AND registration_status NOT IN ('rejected', 'canceled', 'Rejected', 'Canceled')
        ");
        $bookStmt->execute([$studentNumber]);
        $bookings = $bookStmt->fetchAll(PDO::FETCH_ASSOC);

        $orderStmt = $this->pdo->prepare("
            SELECT id, course_code
            FROM cc_certificate_order
            WHERE created_by = ? AND certificate_status NOT IN ('Cancelled', 'Canceled', 'Rejected')
        ");
        $orderStmt->execute([$studentNumber]);
        $orders = $orderStmt->fetchAll(PDO::FETCH_ASSOC);

        // Map every expanded identifier of an existing booking/order to its reason
        $existingMap = [];
        foreach ($bookings as $b) {
            $tokens = array_filter(array_map('trim', explode(',', (string)$b['course_id'])));
            foreach ($this->expandCourseTokens($tokens) as $key) {
                $existingMap[$key] = $existingMap[$key] ?? ['type' => 'booking', 'reference' => $b['reference_number']];
            }
        }
        foreach ($orders as $o) {
            $tokens = array_filter(array_map('trim', explode(',', (string)$o['course_code'])));
            foreach ($this->expandCourseTokens($tokens) as $key) {
                $existingMap[$key] = $existingMap[$key] ?? ['type' => 'order', 'reference' => $o['id']];
            }
        }
        if (empty($existingMap)) return null;

        foreach ($this->expandCourseTokens($requestedIds) as $key) {
            if (isset($existingMap[$key])) {
                $hit = $existingMap[$key];
                if ($hit['type'] === 'booking') {
                    $message = "Course {$key} is already included in your convocation booking (Ref #{$hit['reference']}). A course can only be booked once.";
                } else {
                    $message = "Course {$key} already has a certificate order (Order #{$hit['reference']}). A course with a certificate order cannot be booked for convocation.";
                }
                return ['course' => $key, 'type' => $hit['type'], 'reference' => $hit['reference'], 'message' => $message];
            }
        }
        return null;
    }

    // POST create a new registration (no reference_number in input)
    public function createRegistration()
    {
        $paymentSlipPath = null;
        $isMultipart = (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false);
        $data = $isMultipart ? $_POST : json_decode(file_get_contents('php://input'), true);
        $file = $isMultipart ? ($_FILES['image'] ?? null) : null;

        // Extract course_ids
        $courseIds = [];
        if (isset($data['course_id'])) {
            if (is_array($data['course_id'])) {
                $courseIds = $data['course_id'];
            } else {
                $courseIds = explode(',', $data['course_id']);
            }
        }

        // Required fields validation
        if (
            !isset($data['student_number']) || empty(trim($data['student_number'])) ||
            empty($courseIds) ||
            !isset($data['package_id']) || empty($data['package_id'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: student_number, course_id, package_id']);
            return;
        }

        $studentNumber = trim($data['student_number']);
        $convocationId = !empty($data['convocation_id']) ? $data['convocation_id'] : null;
        $session = !empty($data['session']) ? (int)$data['session'] : 1;

        // 0. Verify Student KYC Verification Status
        $isKycVerified = false;
        try {
            $identifiers = [$studentNumber];
            $noSlash = str_replace('/', '', $studentNumber);
            if (!empty($noSlash)) $identifiers[] = $noSlash;
            if (preg_match('/^([A-Za-z]+)(\d{2})(\d{3,})$/', $studentNumber, $m)) {
                $identifiers[] = $m[1] . '/' . $m[2] . '/' . $m[3];
            }
            $identifiers = array_values(array_unique(array_filter($identifiers)));
            $placeholders = implode(',', array_fill(0, count($identifiers), '?'));

            // 1. Check users table verification_status
            $userStmt = $this->pdo->prepare("
                SELECT verification_status 
                FROM users 
                WHERE username IN ($placeholders) OR userid IN ($placeholders)
                LIMIT 1
            ");
            $userStmt->execute(array_merge($identifiers, $identifiers));
            $userRow = $userStmt->fetch(PDO::FETCH_ASSOC);
            if ($userRow) {
                $uStatus = strtolower(trim($userRow['verification_status'] ?? ''));
                if ($uStatus === 'verified' || $uStatus === 'approved') {
                    $isKycVerified = true;
                }
            }

            // 2. Check student_document_verifications table status
            if (!$isKycVerified) {
                $docStmt = $this->pdo->prepare("
                    SELECT status 
                    FROM student_document_verifications 
                    WHERE student_id IN ($placeholders) 
                    ORDER BY id DESC LIMIT 1
                ");
                $docStmt->execute($identifiers);
                $docRow = $docStmt->fetch(PDO::FETCH_ASSOC);
                if ($docRow) {
                    $dStatus = strtolower(trim($docRow['status'] ?? ''));
                    if ($dStatus === 'approved' || $dStatus === 'verified') {
                        $isKycVerified = true;
                    }
                }
            }

            // 3. Check user_full_details table verification_status
            if (!$isKycVerified) {
                $ufdStmt = $this->pdo->prepare("
                    SELECT verification_status 
                    FROM user_full_details 
                    WHERE username IN ($placeholders) OR student_id IN ($placeholders) 
                    LIMIT 1
                ");
                $ufdStmt->execute(array_merge($identifiers, $identifiers));
                $ufdRow = $ufdStmt->fetch(PDO::FETCH_ASSOC);
                if ($ufdRow) {
                    $ufdStatus = strtolower(trim($ufdRow['verification_status'] ?? ''));
                    if ($ufdStatus === 'verified' || $ufdStatus === 'approved') {
                        $isKycVerified = true;
                    }
                }
            }
        } catch (Exception $e) {
            // Silently log or continue
        }

        if (!$isKycVerified) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Student Document Verification (KYC) must be approved before you can register for a convocation ceremony. Please complete your identity verification first.'
            ]);
            return;
        }

        // 1. Check for Duplicate Active Booking
        if ($convocationId) {
            $existing = $this->model->getActiveRegistrationByStudentAndConvocation($studentNumber, $convocationId);
            if ($existing) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'You already have an active registration for this convocation ceremony.',
                    'reference_number' => $existing['reference_number']
                ]);
                return;
            }
        }

        // 1b. Block courses already booked in ANY ceremony or with a pending/printed certificate order
        $courseConflict = $this->findCourseConflict($studentNumber, $courseIds);
        if ($courseConflict) {
            http_response_code(409);
            echo json_encode([
                'error' => $courseConflict['message'],
                'conflict' => $courseConflict
            ]);
            return;
        }

        // 2. Check Session Capacity Limits
        if ($convocationId) {
            $convocation = $this->convocationModel->getConvocationById($convocationId);
            if ($convocation) {
                $configuredSessions = (int)($convocation['session_count'] ?? 1);
                if ($session > $configuredSessions) {
                    http_response_code(400);
                    echo json_encode([
                        'error' => "Session {$session} is not available for this ceremony. Only {$configuredSessions} session(s) configured."
                    ]);
                    return;
                }
                $maxSeats = ($session === 2) ? (int)($convocation['session_2'] ?? 0) : (int)($convocation['student_seats'] ?? 0);
                if ($maxSeats > 0) {
                    $currentRegistered = $this->model->getSessionCount($convocationId, $session);
                    if ($currentRegistered >= $maxSeats) {
                        http_response_code(409);
                        echo json_encode([
                            'error' => "Session {$session} is already fully booked. Please select another session."
                        ]);
                        return;
                    }
                }
            }
        }

        // 3. Handle and Validate File Upload
        if (!empty($file) && $file['error'] === UPLOAD_ERR_OK) {
            $maxFileSize = 5 * 1024 * 1024; // 5MB limit
            if ($file['size'] > $maxFileSize) {
                http_response_code(400);
                echo json_encode(['error' => 'Payment slip file size exceeds maximum limit of 5MB']);
                return;
            }

            $fileTmpPath = $file['tmp_name'];
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
            if (!in_array($fileExtension, $allowedExtensions, true)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid file extension. Allowed formats: JPG, JPEG, PNG, WEBP, PDF']);
                return;
            }

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $fileTmpPath);
            finfo_close($finfo);

            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!in_array($mimeType, $allowedMimes, true)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid file type. Only genuine image and PDF files are allowed']);
                return;
            }

            $imageHash = hash_file('sha256', $fileTmpPath);
            $data['hash_value'] = $imageHash;

            $sanitizedStudentNumber = preg_replace('/[^a-zA-Z0-9_\-]/', '', $studentNumber);
            $fileName = $sanitizedStudentNumber . "-payment-" . uniqid() . '.' . $fileExtension;
            $localUploadPath = './uploads/' . $fileName;
            $ftpFilePath = "/payment-slips/" . $fileName;

            if (!is_dir('./uploads/')) {
                mkdir('./uploads/', 0777, true);
            }

            if (!move_uploaded_file($fileTmpPath, $localUploadPath)) {
                http_response_code(400);
                echo json_encode(['error' => 'File upload failed on temporary storage']);
                return;
            }

            if ($this->uploadToFTP($localUploadPath, $ftpFilePath)) {
                $paymentSlipPath = $ftpFilePath;
                unlink($localUploadPath);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'FTP upload failed']);
                return;
            }
        }

        // 4. Update Name on Certificate & Telephone in user_full_details if provided
        if (!empty($data['name_on_certificate'])) {
            $this->userFullDetailsController->model->updateCertificateNameByUserName(
                $studentNumber,
                trim($data['name_on_certificate'])
            );
        }
        if (!empty($data['telephone_1'])) {
            $stmtPhone = $this->pdo->prepare("UPDATE user_full_details SET telephone_1 = :phone WHERE username = :username");
            $stmtPhone->execute(['phone' => trim($data['telephone_1']), 'username' => $studentNumber]);
        }

        $courseIdsString = implode(',', $courseIds);

        // 5. Create Registration inside a Transaction
        try {
            $this->pdo->beginTransaction();

            // Re-verify capacity under lock if convocationId provided
            if ($convocationId) {
                $convocation = $this->convocationModel->getConvocationById($convocationId);
                if ($convocation) {
                    $configuredSessions = (int)($convocation['session_count'] ?? 1);
                if ($session > $configuredSessions) {
                    http_response_code(400);
                    echo json_encode([
                        'error' => "Session {$session} is not available for this ceremony. Only {$configuredSessions} session(s) configured."
                    ]);
                    return;
                }
                $maxSeats = ($session === 2) ? (int)($convocation['session_2'] ?? 0) : (int)($convocation['student_seats'] ?? 0);
                    if ($maxSeats > 0) {
                        $currentCount = $this->model->getSessionCount($convocationId, $session);
                        if ($currentCount >= $maxSeats) {
                            $this->pdo->rollBack();
                            http_response_code(409);
                            echo json_encode(['error' => "Session {$session} is already fully booked."]);
                            return;
                        }
                    }
                }
            }

            $registration_id = $this->model->createRegistration(
                $studentNumber,
                $courseIdsString,
                $data['package_id'],
                $data['event_id'] ?? null,
                $data['payment_status'] ?? 'pending',
                0, // Initial booking payment amount is 0 until admin verifies
                $data['registration_status'] ?? 'pending',
                $data['hash_value'] ?? null,
                $paymentSlipPath,
                $data['additional_seats'] ?? 0,
                $session,
                $convocationId,
                $data['refreshment_tokens'] ?? 0,
                (!empty($data['medal_type_id']) && $data['medal_type_id'] !== 'none') ? (is_array($data['medal_type_id']) ? implode(',', array_filter($data['medal_type_id'])) : trim((string)$data['medal_type_id'])) : null
            );

            $this->pdo->commit();

            http_response_code(201);
            echo json_encode([
                'package_id' => $data['package_id'],
                'registration_id' => $registration_id,
                'reference_number' => $registration_id,
                'message' => 'Registration created successfully',
                'payment_slip_path' => $paymentSlipPath
            ]);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(['error' => 'Database error during registration: ' . $e->getMessage()]);
        }
    }

    // PUT update a registration
    public function updateRegistration($registration_id)
    {
        // Get the new data from the request
        $data = json_decode(file_get_contents('php://input'), true);

        // Get the existing registration data
        $existing_registration = $this->model->getRegistrationById($registration_id);

        if (!$existing_registration) {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
            return;
        }

        // Merge the new data with the existing data
        $updated_data = array_merge($existing_registration, $data);

        // Now call the model's update function with the full dataset
        $success = $this->model->updateRegistration(
            $registration_id,
            $updated_data['student_number'],
            $updated_data['course_id'],
            $updated_data['package_id'],
            $updated_data['event_id'],
            $updated_data['payment_status'],
            $updated_data['payment_amount'],
            $updated_data['registration_status'],
            $updated_data['convocation_id'],
            $updated_data['session'],
            $updated_data['additional_seats'],
            $updated_data['refreshment_tokens'] ?? 0,
            (!empty($updated_data['medal_type_id']) && $updated_data['medal_type_id'] !== 'none') ? (is_array($updated_data['medal_type_id']) ? implode(',', array_filter($updated_data['medal_type_id'])) : trim((string)$updated_data['medal_type_id'])) : null
        );

        if ($success) {
            echo json_encode(['message' => 'Registration updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Registration update failed']);
        }
    }

    // DELETE a registration
    public function deleteRegistration($registration_id)
    {
        $registration = $this->model->getRegistrationById($registration_id);
        if (!$registration) {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
            return;
        }

        $success = $this->model->deleteRegistration($registration_id);
        if ($success) {
            // Also clean up any convocation_student_info if exists so student pass doesn't linger
            if (!empty($registration['student_number']) && !empty($registration['convocation_id'])) {
                try {
                    $stmt = $this->pdo->prepare("DELETE FROM convocation_student_info WHERE student_number = ? AND convocation_id = ?");
                    $stmt->execute([$registration['student_number'], $registration['convocation_id']]);
                } catch (\Exception $e) {
                    error_log("Failed to clean up convocation_student_info: " . $e->getMessage());
                }
            }
            http_response_code(200);
            echo json_encode(['message' => 'Registration deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Registration not found or deletion failed']);
        }
    }

    public function updateSession($reference_number)
    {
        if (!isset($_POST['session'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required session field']);
            return;
        }

        $session = $_POST['session'];

        $updated = $this->model->updateSession($reference_number, $session);
        if ($updated) {
            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Session updated to ' . $session,
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }


    public function updateAdditionalSeats($reference_number)
    {
        if (!isset($_POST['additional_seats'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required session field']);
            return;
        }

        $additional_seats = $_POST['additional_seats'];

        $updated = $this->model->updateAdditionalSeats($reference_number, $additional_seats);
        if ($updated) {
            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Additional Seats updated to ' . $additional_seats,
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }

    public function updateRefreshmentTokens($reference_number)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $tokens = $_POST['refreshment_tokens'] ?? $input['refreshment_tokens'] ?? null;
        if ($tokens === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required refreshment_tokens field']);
            return;
        }

        $refreshment_tokens = (int)$tokens;

        $updated = $this->model->updateRefreshmentTokens($reference_number, $refreshment_tokens);
        if ($updated) {
            http_response_code(200);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Refreshment tokens updated to ' . $refreshment_tokens,
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update refreshment tokens']);
        }
    }

    public function updateMedalType($reference_number)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $rawMedal = $_POST['medal_type_id'] ?? $input['medal_type_id'] ?? null;
        if (is_array($rawMedal)) {
            $rawMedal = implode(',', array_filter($rawMedal));
        }
        $medal_type_id = (!empty($rawMedal) && $rawMedal !== 'none') ? trim((string)$rawMedal) : null;

        $updated = $this->model->updateMedalType($reference_number, $medal_type_id);
        if ($updated) {
            http_response_code(200);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Medal type updated',
                'reference_number' => $reference_number,
                'medal_type_id' => $medal_type_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update medal type']);
        }
    }

    public function updatePackages($reference_number)
    {
        if (!isset($_POST['package_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required session field']);
            return;
        }

        $package_id = $_POST['package_id'];

        $updated = $this->model->updatePackages($reference_number, $package_id);
        if ($updated) {
            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Package updated',
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }


    public function updatePayment($reference_number)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['payment_status']) || !isset($data['payment_amount'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required payment fields']);
            return;
        }

        $paymentAmount = (float) $data['payment_amount'];
        $recInfo = $this->model->getRegistrationByReference($reference_number);
        if (!$recInfo) {
            http_response_code(404);
            echo json_encode(['error' => 'Convocation registration not found']);
            return;
        }

        $student_number = $recInfo['student_number'];
        $convocation_id = $recInfo['convocation_id'];
        $recAmount = $recInfo['payment_amount'];

        $paybleAmount = $this->model->getPayableAmount($reference_number);
        $paidAmount = $this->transactionPaymentController->model->getPaidAmount($student_number, 'covocation-payment-'.$convocation_id);
        $studentInfo = $this->userFullDetailsController->model->getUserByUserName($student_number);
        $txnNumber = $this->transactionPaymentController->generateTransactionId();

        $paymentData = [
            'transaction_id'    => $txnNumber,
            'rec_time'          => date('Y-m-d H:i:s'),
            'reference'         => 'Convocation Payment',
            'ref_id'            => '1',
            'created_by'        => $data['created_by'] ?? '',
            'created_at'        => date('Y-m-d H:i:s'),
            'student_number'    => $student_number,
            'transaction_type'  => "CREDIT",
            'reference_key'     => 'covocation-payment-'.$convocation_id,
            'payment_amount'    => $paymentAmount
        ];

        $updatePaymentAmount = $paidAmount + $paymentAmount;

        $created = $this->transactionPaymentController->model->createPayment($paymentData);

        if (!$created) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create payment record']);
            return;
        }

        $updated = $this->model->updatePayment($reference_number, $data['payment_status'], $updatePaymentAmount);

        if ($updated) {
            // Also sync any pending 2nd payment request for this convocation to Approved
            try {
                $stmtReq = $this->pdo->prepare("
                    UPDATE payment_requests 
                    SET payment_status = 'Approved' 
                    WHERE (unique_number = ? OR reference = ?) AND payment_reson = ? AND payment_status = 'Pending'
                ");
                $stmtReq->execute([$student_number, $reference_number, 'convocation2nd-' . $convocation_id]);
            } catch (Exception $e) {
                error_log("Failed to update payment_requests status: " . $e->getMessage());
            }

            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Payment record created and convocation updated',
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }


    public function GetListbyCourseAndSession($courseCode, $session)
    {
        $registrations = $this->model->GetListbyCourseAndSession($courseCode, $session);
        if ($registrations) {
            echo json_encode($registrations);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No registrations found for the specified course and session']);
        }
    }

    public function GetListbyCourse($courseCode)
    {
        $registrations = $this->model->getListbyCourse($courseCode);
        if ($registrations) {
            echo json_encode($registrations);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No registrations found for the specified course']);
        }
    }

    public function GetListbySession($session)
    {
        $registrations = $this->model->getListbySession($session);
        if ($registrations) {
            echo json_encode($registrations);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No registrations found for the specified session']);
        }
    }



    /**
     * Send the appropriate ceremonyâ€‘related SMS and return a JSON status block.
     *
     * Contract:
     *   - Success  â†’ HTTP 200 + { status: "success", ...extraInfo }
     *   - Business error (e.g. missing data) â†’ HTTP 400 + { status: "error", message: "..." }
     *   - System/runtime error              â†’ HTTP 500 + { status: "error", message: "..." }
     *
     * @param string $reference_number
     * @return void  (prints/echoes JSON + sets http_response_code)
     */
    public function notifyCeremonyNumber($reference_number)
    {
        /* ----------------------------------------------------
         * 1. Validate & fetch registration
         * -------------------------------------------------- */
        $registration = $this->model->getRegistrationByReference($reference_number);
        if (!$registration) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Registration not found', 'reference_number' => $reference_number];
        }

        $studentNumber  = $registration['student_number'];
        $ceremonyNumber = $registration['ceremony_number'] ?? 'Not Assigned';

        /* ----------------------------------------------------
         * 2. Calculate balances (helper throws on failure)
         * -------------------------------------------------- */
        try {
            $balances = $this->calculateStudentDueAmount($reference_number);
        } catch (RuntimeException $e) {
            http_response_code(400);
            return ['status' => 'error', 'message' => $e->getMessage()];
        }

        /* ----------------------------------------------------
         * 3. Fetch contact info
         * -------------------------------------------------- */
        $studentInfo = $this->userFullDetailsController->model->getUserByUserName($studentNumber);
        $mobile      = $studentInfo['telephone_1']        ?? null;
        $studentName = $studentInfo['name_on_certificate'] ?? 'Student';

        if (!$mobile) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Mobile number not found for student'];
        }

        /* ----------------------------------------------------
         * 4. Send SMS (handle SMS gateway result)
         * -------------------------------------------------- */
        try {
            if ($balances['convocation_balance'] > 0 || $balances['course_balance'] > 0) {
                $smsOk = $this->smsModel->sendCeremonyDueBreakdownSMS(
                    $mobile,
                    $studentName,
                    $balances['course_balance'],
                    $balances['convocation_balance']
                );
            } else {
                $smsOk = $this->smsModel->sendCeremonyNumberSMS(
                    $mobile,
                    $studentName,
                    $ceremonyNumber
                );
            }

            if (!$smsOk) {
                http_response_code(502);
                return ['status' => 'error', 'message' => 'SMS gateway returned failure'];
            }
        } catch (Exception $e) {
            http_response_code(502);
            return ['status' => 'error', 'message' => 'SMS send failed: ' . $e->getMessage()];
        }

        /* ----------------------------------------------------
         * 5. Success response
         * -------------------------------------------------- */
        http_response_code(200);
        return [
            'status'            => 'success',
            'reference_number'  => $reference_number,
            'ceremony_number'   => $ceremonyNumber,
            'balances'          => $balances,
            'mobile'            => $mobile
        ];
    }



    // GET a single registration by student number (alphanumeric)
    public function GetCeremonyNumberByStudentNumber($studentNumber)
    {
        /* ----------------------------------------------------
         * 1. Validate & fetch registration
         * -------------------------------------------------- */
        $registration = $this->model->getRegistrationByStudentNumber($studentNumber);
        if (!$registration) {
            http_response_code(404);   // Not Found
            echo json_encode(['status' => 'error', 'message' => 'Registration not found', 'student_number' => $studentNumber]);
            return;
        }

        $reference_number  = $registration['reference_number'];
        $ceremonyNumber = $registration['ceremony_number'] ?? 'Not Assigned';

        /* ----------------------------------------------------
         * 2. Calculate balances (helper throws on failure)
         * -------------------------------------------------- */
        try {
            $balances = $this->calculateStudentDueAmount($reference_number);
        } catch (RuntimeException $e) {
            http_response_code(400);   // Bad Request (missing package, etc.)
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            return;
        }

        /* ----------------------------------------------------
         * 3. Fetch contact info
         * -------------------------------------------------- */
        $studentInfo = $this->userFullDetailsController->model->getUserByUserName($studentNumber);
        $mobile      = $studentInfo['telephone_1']        ?? null;
        $studentName = $studentInfo['name_on_certificate'] ?? 'Student';

        if (!$mobile) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Mobile number not found for student']);
            return;
        }

        /* ----------------------------------------------------
         * 5. Success response
         * -------------------------------------------------- */
        http_response_code(200);
        echo json_encode([
            'status'            => 'success',
            'reference_number'  => $reference_number,
            'ceremony_number'   => $ceremonyNumber,
            'balances'          => $balances,
            'mobile'            => $mobile,
            'registration'      => $registration
        ]);
    }





    public function UpdateCeremonyNumber(string $reference_number): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['ceremony_number']) || trim($data['ceremony_number']) === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ceremony_number']);
            return;
        }
        $ceremony_number = trim($data['ceremony_number']);

        // Make sure the registration exists
        $registration = $this->model->getRegistrationByReference($reference_number);
        if (!$registration) {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
            return;
        }

        // Persist the new ceremony number in convocation_registrations
        if (!$this->model->updateCeremonyNumber($reference_number, $ceremony_number)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
            return;
        }

        // Sync with convocation_student_info so student pass is immediately available
        if (!empty($registration['convocation_id']) && !empty($registration['student_number'])) {
            $this->convocationStudentInfoModel->upsertStudentInfo(
                $registration['convocation_id'],
                $registration['student_number'],
                $ceremony_number
            );
        }

        // ðŸ”” Trigger SMS logic cleanly
        $smsResult = $this->notifyCeremonyNumber($reference_number);

        http_response_code(200);
        echo json_encode([
            'status'           => 'success',
            'ceremony_number'  => $ceremony_number,
            'reference_number' => $reference_number,
            'sms'              => $smsResult
        ]);
    }





    public function updateCertificatePrintStatus($reference_number)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['certificate_print_status']) || empty($data['certificate_print_status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required certificate print status field']);
            return;
        }

        $certificate_print_status = $data['certificate_print_status'];
        $certificate_id = $data['certificate_id'] ?? null;
        $updated = $this->model->updateCertificatePrintStatus($certificate_print_status, $certificate_id, $reference_number);
        if ($updated) {
            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Certificate print status updated to ' . $certificate_print_status,
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }

    public function updateAdvancedCertificatePrintStatus($reference_number)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['advanced_print_status']) || empty($data['advanced_print_status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required advanced print status field']);
            return;
        }

        $advanced_print_status = $data['advanced_print_status'];
        $advanced_certifiate_id = $data['advanced_certifiate_id'] ?? null;

        $updated = $this->model->updateAdvancedCertificatePrintStatus($advanced_print_status, $advanced_certifiate_id, $reference_number);
        if ($updated) {
            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Advanced certificate print status updated to ' . $advanced_print_status,
                'reference_number' => $reference_number,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }


    // --- private helper ---------------------------
    private function calculateStudentDueAmount(string $reference_number): array
    {
        $registration = $this->model->getRegistrationByReference($reference_number);
        if (!$registration) {
            // Let caller decide what to do.
            throw new RuntimeException('Registration not found');
        }

        $studentNumber     = $registration['student_number'];
        $package           = $this->packageController->model->getPackageById($registration['package_id']);

        if (!$package) {
            throw new RuntimeException('Package not found');
        }

        $ceremony = !empty($registration['convocation_id']) ? $this->convocationModel->getConvocationById($registration['convocation_id']) : null;
        $seatRate = (isset($ceremony['parent_seat_price']) && $ceremony['parent_seat_price'] !== null)
            ? (float)$ceremony['parent_seat_price']
            : (defined('PARENT_SEAT_RATE') ? PARENT_SEAT_RATE : 750);
        $tokenRate = (isset($ceremony['refreshment_token_price']) && $ceremony['refreshment_token_price'] !== null)
            ? (float)$ceremony['refreshment_token_price']
            : 0;

        $totalPayable = (float)$package['price']
            + (((int)($registration['additional_seats'] ?? 0)) * $seatRate)
            + (((int)($registration['refreshment_tokens'] ?? 0)) * $tokenRate);

        $convocationBalance = $totalPayable - (float)$registration['payment_amount'];
        $courseBalance      = $this->CcEvaluationController->model->GetStudentBalance($studentNumber)['studentBalance'] ?? 0;

        return [
            'course_balance'      => (float) $courseBalance,
            'convocation_balance' => (float) $convocationBalance,
            'total_due'           => (float) ($courseBalance + $convocationBalance),
        ];
    }

    private function calculateStudentDueAmountByStudentNumber(string $student_number): array
    {
        $registration = $this->model->getRegistrationByStudentNumber($student_number);
        if (!$registration) {
            // Let caller decide what to do.
            throw new RuntimeException('Registration not found for student number: ' . $student_number);
        }

        $package = $this->packageController->model->getPackageById($registration['package_id']);
        if (!$package) {
            throw new RuntimeException('Package not found');
        }

        $ceremony = !empty($registration['convocation_id']) ? $this->convocationModel->getConvocationById($registration['convocation_id']) : null;
        $seatRate = (isset($ceremony['parent_seat_price']) && $ceremony['parent_seat_price'] !== null)
            ? (float)$ceremony['parent_seat_price']
            : (defined('PARENT_SEAT_RATE') ? PARENT_SEAT_RATE : 750);
        $tokenRate = (isset($ceremony['refreshment_token_price']) && $ceremony['refreshment_token_price'] !== null)
            ? (float)$ceremony['refreshment_token_price']
            : 0;

        $totalPayable = (float)$package['price']
            + (((int)($registration['additional_seats'] ?? 0)) * $seatRate)
            + (((int)($registration['refreshment_tokens'] ?? 0)) * $tokenRate);

        $convocationBalance = $totalPayable - (float)$registration['payment_amount'];
        $courseBalance      = $this->CcEvaluationController->model->GetStudentBalance($student_number)['studentBalance'] ?? 0;

        return [
            'course_balance'      => (float) $courseBalance,
            'convocation_balance' => (float) $convocationBalance,
            'total_due'           => (float) ($courseBalance + $convocationBalance),
        ];
    }

    public function GetStudentDueAmount(string $reference_number): void
    {
        try {
            $balances = $this->calculateStudentDueAmount($reference_number);
            http_response_code(200);
            echo json_encode($balances);
        } catch (RuntimeException $e) {
            http_response_code(404);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function GetStudentDueAmountByStudentNumber(string $student_number): void
    {
        try {
            $balances = $this->calculateStudentDueAmountByStudentNumber($student_number);
            http_response_code(200);
            echo json_encode($balances);
        } catch (RuntimeException $e) {
            http_response_code(404);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateCourses($registration_id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['course_id']) || empty($data['course_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required course_id field']);
            return;
        }

        $courseIds = is_array($data['course_id']) ? $data['course_id'] : [$data['course_id']];
        $courseIdsString = implode(',', $courseIds);

        $updated = $this->model->updateCourses($registration_id, $courseIdsString);
        if ($updated) {
            http_response_code(201);
            echo json_encode([
                'status' => 'Success',
                'message' => 'Courses updated successfully',
                'registration_id' => $registration_id,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
        }
    }

    public function deleteConvocationPayment($registration_id, $transaction_id)
{
    // 1. Get the payment to be deleted
    $payment = $this->transactionPaymentController->model->getPaymentById($transaction_id);

    if (!$payment) {
        http_response_code(404);
        echo json_encode(['error' => 'Payment transaction not found']);
        return;
    }

    // 2. Get the registration associated with the payment
    $registration = $this->model->getRegistrationById($registration_id);

    if (!$registration) {
        http_response_code(404);
        echo json_encode(['error' => 'Convocation registration not found']);
        return;
    }
    
    // 4. Calculate the new payment amount for the convocation booking
    $newPaymentAmount = $registration['payment_amount'] - $payment['payment_amount'];
    if ($newPaymentAmount < 0) {
        $newPaymentAmount = 0; // Ensure it never goes below zero
    }

    // 5. Set the payment status to 'pending' as requested
    $paymentStatus = 'pending';

    // 6. Update the convocation registration FIRST
    $updated = $this->model->updateDeletedPayment($registration_id, $paymentStatus, $newPaymentAmount);

    if ($updated) {
        // 7. If the update was successful, THEN delete the transaction record
        $deleted = $this->transactionPaymentController->model->deletePayment($transaction_id);
        if ($deleted) {
            http_response_code(200);
            echo json_encode(['message' => 'Payment deleted and convocation registration updated successfully.']);
        } else {
            // This is a critical error state, as the booking was updated but the payment wasn't deleted.
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete payment transaction after updating registration. Manual check required.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update convocation registration.']);
    }
}

    public function downloadBookingSummaryPdf($id)
    {
        try {
            $registration = null;
            if (is_numeric($id)) {
                $registration = $this->model->getRegistrationById($id);
                if (!$registration) {
                    $registration = $this->model->getRegistrationByReference($id);
                }
            } else {
                $registrations = $this->model->getRegistrationByStudentNumber($id);
                if (!empty($registrations)) {
                    $registration = $registrations[0];
                }
            }

            if (!$registration) {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Convocation registration not found']);
                return;
            }

            $studentNumber = $registration['student_number'];
            $user = $this->userFullDetailsController->model->getUserByUserName($studentNumber);
            $ceremony = !empty($registration['convocation_id']) ? $this->convocationModel->getConvocationById($registration['convocation_id']) : null;
            $pkg = !empty($registration['package_id']) ? $this->packageController->model->getPackageById($registration['package_id']) : null;

            // Rates & Totals
            $seatRate = (isset($ceremony['parent_seat_price']) && $ceremony['parent_seat_price'] !== null)
                ? (float)$ceremony['parent_seat_price']
                : (defined('PARENT_SEAT_RATE') ? PARENT_SEAT_RATE : 750.00);
            $tokenRate = (isset($ceremony['refreshment_token_price']) && $ceremony['refreshment_token_price'] !== null)
                ? (float)$ceremony['refreshment_token_price']
                : 0.00;

            $pkgPrice = (float)($pkg['price'] ?? 0);
            $additionalSeats = (int)($registration['additional_seats'] ?? 0);
            $additionalSeatsSubtotal = $additionalSeats * $seatRate;
            $tokens = (int)($registration['refreshment_tokens'] ?? 0);
            $tokensSubtotal = $tokens * $tokenRate;

            $totalPayable = $pkgPrice + $additionalSeatsSubtotal + $tokensSubtotal;
            $paidAmount = (float)($registration['payment_amount'] ?? 0);
            $dueBalance = max(0, $totalPayable - $paidAmount);

            // Course names
            $courseNames = [];
            if (!empty($registration['course_id'])) {
                $cIds = array_map('trim', explode(',', $registration['course_id']));
                foreach ($cIds as $cid) {
                    if (is_numeric($cid)) {
                        $st = $this->pdo->prepare("SELECT course_name FROM parent_main_course WHERE id = ?");
                        $st->execute([$cid]);
                        $cn = $st->fetchColumn();
                        if ($cn) {
                            $courseNames[] = $cn;
                            continue;
                        }
                        $st = $this->pdo->prepare("SELECT course_name, course_code FROM course WHERE id = ?");
                        $st->execute([$cid]);
                        $cRow = $st->fetch(PDO::FETCH_ASSOC);
                        if ($cRow) {
                            $courseNames[] = $cRow['course_name'] . ($cRow['course_code'] ? ' (' . $cRow['course_code'] . ')' : '');
                            continue;
                        }
                    }
                    $courseNames[] = $cid;
                }
            }
            if (empty($courseNames)) {
                $courseNames[] = 'Pharmacy Practice Program';
            }

            // Package included items
            $pkgFeatures = [];
            if (!empty($pkg['student_seat'])) $pkgFeatures[] = 'Student Seat';
            if (!empty($pkg['graduation_cloth'])) $pkgFeatures[] = 'Graduation Cloak';
            if (!empty($pkg['garland'])) $pkgFeatures[] = 'Garland';
            if (!empty($pkg['scroll'])) $pkgFeatures[] = 'Scroll';
            if (!empty($pkg['certificate_file'])) $pkgFeatures[] = 'Certificate File';
            if (!empty($pkg['photo_package'])) $pkgFeatures[] = 'Graduation Hat';
            if (!empty($pkg['video_360'])) $pkgFeatures[] = '360 Video';
            if (!empty($pkg['refreshments'])) $pkgFeatures[] = 'Refreshments';

            $pkgFeaturesHtml = '';
            if (!empty($pkgFeatures)) {
                $pkgFeaturesHtml .= '<table style="width: 100%; margin-top: 6px; border: none; font-size: 9.5px; color: #475569;">';
                $chunks = array_chunk($pkgFeatures, 2);
                foreach ($chunks as $chunk) {
                    $pkgFeaturesHtml .= '<tr>';
                    $pkgFeaturesHtml .= '<td style="padding: 2.5px 0; border: none; width: 50%;"><span style="color: #0f766e; font-weight: bold;">&bull;</span> ' . htmlspecialchars($chunk[0]) . '</td>';
                    $pkgFeaturesHtml .= '<td style="padding: 2.5px 0; border: none; width: 50%;">' . (isset($chunk[1]) ? '<span style="color: #0f766e; font-weight: bold;">&bull;</span> ' . htmlspecialchars($chunk[1]) : '') . '</td>';
                    $pkgFeaturesHtml .= '</tr>';
                }
                $pkgFeaturesHtml .= '</table>';
            }

            $refNumber = $registration['reference_number'] ?: $registration['registration_id'];
            $logoPath = __DIR__ . '/../assets/Ceylon-Pharma-College_LOGO.png';
            $logoSrc = file_exists($logoPath) ? ('data:image/png;base64,' . base64_encode(file_get_contents($logoPath))) : '';

            $warningSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#fef08a" stroke="#a16207" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
            $warningIcon = 'data:image/svg+xml;base64,' . base64_encode($warningSvg);


            $heldDateFormatted = !empty($ceremony['held_on']) ? date('l, d F Y', strtotime($ceremony['held_on'])) : 'To Be Announced';
            $regDateFormatted = !empty($registration['registered_at']) ? date('d M Y, h:i A', strtotime($registration['registered_at'])) : date('d M Y');

            $statusColor = ($registration['payment_status'] === 'paid' || $registration['payment_status'] === 'verified') ? '#15803d' : (($dueBalance <= 0) ? '#15803d' : '#b45309');
            $statusText = strtoupper($registration['payment_status'] ?? 'PENDING');
            if ($statusText === 'PARTIALLY-PAID') $statusText = 'PARTIALLY PAID';

            $sessionDisplay = 'Session ' . ($registration['session'] ?? 1);

            $ceremonyNum = !empty($registration['ceremony_number']) ? htmlspecialchars($registration['ceremony_number']) : 'Pending Verification';
            $nameOnCert = htmlspecialchars($registration['name_on_certificate'] ?? $user['name_on_certificate'] ?? $user['full_name'] ?? 'N/A');
            $fullName = htmlspecialchars($user['full_name'] ?? $nameOnCert);
            $phone = htmlspecialchars($registration['telephone_1'] ?? $user['telephone_1'] ?? 'N/A');
            $nic = htmlspecialchars($user['nic'] ?? 'N/A');

            $medalsRaw = !empty($registration['medal_name']) ? trim($registration['medal_name']) : '';
            $medalsHtml = '';
            if (!empty($medalsRaw)) {
                $medalParts = array_map('trim', explode(',', $medalsRaw));
                $badges = [];
                foreach ($medalParts as $m) {
                    if (!empty($m)) {
                        $badges[] = '<span style="display: inline-block; background-color: #fef3c7; color: #92400e; border: 1.5px solid #f59e0b; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 10.5px; margin-right: 6px;">&#9733; ' . htmlspecialchars($m) . '</span>';
                    }
                }
                $medalsHtml = implode(' ', $badges);
            } else {
                $medalsHtml = '<span style="color: #64748b; font-size: 10px; font-style: italic;">Standard Graduand (No special academic awards assigned)</span>';
            }
            $email = htmlspecialchars($user['e_mail'] ?? 'N/A');

            $vipSeatsCount = !empty($pkg['vip_seat']) ? (int)$pkg['vip_seat'] : 0;

            $html = '
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Convocation Admission #' . $refNumber . '</title>
<style>
    @page {
        margin: 8mm 11mm 8mm 11mm;
    }
    body {
        font-family: "DejaVu Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 11px;
        color: #1e293b;
        line-height: 1.35;
        margin: 0;
        padding: 0;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    .header-table {
        border-bottom: 2px solid #0f766e;
        padding-bottom: 6px;
        margin-bottom: 8px;
    }
    .doc-type {
        font-size: 16px;
        font-weight: 800;
        color: #0f766e;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .inst-sub {
        font-size: 9.5px;
        color: #64748b;
        margin-top: 2px;
        font-weight: 600;
        letter-spacing: 0.3px;
    }
    .ref-badge {
        text-align: right;
    }
    .ref-title {
        font-size: 9px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
    }
    .ref-no {
        font-size: 24px;
        font-weight: 900;
        color: #0f766e;
        letter-spacing: 1.5px;
        line-height: 1.1;
    }
    .disclaimer-box {
        background-color: #fefce8;
        border: 1.5px dashed #ca8a04;
        border-radius: 6px;
        padding: 7px 11px;
        margin-bottom: 8px;
    }
    .disclaimer-title {
        font-size: 10px;
        font-weight: 800;
        color: #a16207;
        margin-bottom: 2px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }
    .disclaimer-body {
        font-size: 8.5px;
        color: #854d0e;
        line-height: 1.35;
    }
    .section-head {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #0f766e;
        border-bottom: 1.5px solid #cbd5e1;
        padding-bottom: 3px;
        margin-bottom: 6px;
    }
    .info-table {
        margin-bottom: 8px;
    }
    .info-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px 11px;
        vertical-align: top;
    }
    .data-label {
        font-size: 8.5px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.3px;
        margin-bottom: 1px;
    }
    .data-val {
        font-size: 11px;
        font-weight: 700;
        color: #0f172a;
    }
    .breakdown-table {
        margin-top: 3px;
        margin-bottom: 8px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
    }
    .breakdown-table th {
        background: #f1f5f9;
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: #334155;
        padding: 6px 9px;
        text-align: left;
        border-bottom: 1.5px solid #cbd5e1;
    }
    .breakdown-table td {
        padding: 6px 9px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 9.5px;
    }
    .breakdown-table tr:last-child td {
        border-bottom: none;
    }
    .text-right {
        text-align: right;
    }
    .notes-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px 11px;
        vertical-align: top;
        margin-top: 6px;
    }
    .notes-title {
        font-size: 9.5px;
        font-weight: 800;
        color: #1e293b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
    }
    .notes-list {
        margin: 0;
        padding-left: 15px;
        font-size: 8px;
        color: #475569;
        line-height: 1.4;
    }
    .notes-list li {
        padding-bottom: 2px;
    }
    .footer {
        border-top: 1px solid #e2e8f0;
        padding-top: 5px;
        margin-top: 8px;
        font-size: 7.5px;
        color: #94a3b8;
        text-align: center;
    }
</style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            ' . (!empty($logoSrc) ? '
            <td style="vertical-align: middle; width: 175px; padding-right: 14px;">
                <img src="' . $logoSrc . '" style="width: 170px; height: auto;" alt="Ceylon Pharma College" />
            </td>' : '') . '
            <td style="vertical-align: middle;">
                <div class="doc-type">Convocation Admission</div>
                <div class="inst-sub">Convocation Management System</div>
            </td>
            <td class="ref-badge" style="vertical-align: middle; width: 180px;">
                <div class="ref-title">Ceremony Number</div>
                <div class="ref-no">' . (!empty($registration['ceremony_number']) ? htmlspecialchars($registration['ceremony_number']) : 'Pending') . '</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-top: 2px;">Booking Ref: #' . $refNumber . '</div>
            </td>
        </tr>
    </table>

    <!-- Prominent Disclaimer -->
    <div class="disclaimer-box">
        <div class="disclaimer-title">
            <img src="' . $warningIcon . '" style="width: 11px; height: 11px; vertical-align: -1px; margin-right: 3px;" alt="Warning" />
            IMPORTANT NOTICE &bull; FOR INFORMATION PURPOSES ONLY
        </div>
        <div class="disclaimer-body">
            <strong>THIS SLIP IS NOT AN ADMISSION PASS AND CANNOT BE USED FOR CONVOCATION VENUE ENTRY.</strong><br>
            This document confirms your registration, selected ceremony package, add-ons, and payment settlement status. Official physical venue entrance passes, guest tickets, and academic regalia tokens are issued exclusively at the Convocation Helpdesk / Verification Counter upon full payment settlement and identity verification.
        </div>
    </div>

    <!-- 2 Column Details: Student Info & Ceremony Info -->
    <table class="info-table" style="width: 100%;">
        <tr>
            <!-- Left: Student Info -->
            <td style="width: 49%; vertical-align: top; padding-right: 6px;">
                <div class="info-card">
                    <div class="section-head">Student Information</div>
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 50%; padding-bottom: 7px;">
                                <div class="data-label">Student ID / Reg No</div>
                                <div class="data-val">' . htmlspecialchars($registration['student_number']) . '</div>
                            </td>
                            <td style="width: 50%; padding-bottom: 7px;">
                                <div class="data-label">NIC / Passport</div>
                                <div class="data-val">' . $nic . '</div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <div class="data-label">Name on Certificate</div>
                                <div class="data-val" style="font-size: 12px; color: #0f766e;">' . $nameOnCert . '</div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>

            <!-- Right: Ceremony Info -->
            <td style="width: 51%; vertical-align: top; padding-left: 6px;">
                <div class="info-card">
                    <div class="section-head">Ceremony &amp; Allocation Details</div>
                    <table style="width: 100%;">
                        <tr>
                            <td colspan="2" style="padding-bottom: 7px;">
                                <div class="data-label">Convocation Event</div>
                                <div class="data-val">' . htmlspecialchars($ceremony['convocation_name'] ?? 'Annual Convocation') . '</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 50%; padding-bottom: 7px;">
                                <div class="data-label">Ceremony Date</div>
                                <div class="data-val">' . $heldDateFormatted . '</div>
                            </td>
                            <td style="width: 50%; padding-bottom: 7px;">
                                <div class="data-label">Allocated Session</div>
                                <div class="data-val">' . $sessionDisplay . '</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 50%;">
                                <div class="data-label">Booking Reference</div>
                                <div class="data-val" style="color: #0f766e; font-size: 12px; font-weight: 700;">#' . $refNumber . '</div>
                            </td>
                            <td style="width: 50%;">
                                <div class="data-label">Registration Date</div>
                                <div class="data-val">' . $regDateFormatted . '</div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- Dedicated Academic Honors & Awards Card -->
    <div style="background: #fffdf5; border: 1px solid #fde68a; border-left: 4.5px solid #f59e0b; border-radius: 6px; padding: 7px 12px; margin-bottom: 10px;">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 190px; vertical-align: middle; border: none;">
                    <div style="font-size: 9.5px; color: #b45309; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Academic Honors / Medals:</div>
                </td>
                <td style="vertical-align: middle; border: none;">
                    ' . $medalsHtml . '
                </td>
            </tr>
        </table>
    </div>

    <!-- Academic Program -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 7px 12px; margin-bottom: 10px;">
        <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800;">Included Academic Program(s): </span>
        <span style="font-size: 11px; font-weight: 800; color: #0f172a;">' . htmlspecialchars(implode(', ', $courseNames)) . '</span>
    </div>

    <!-- Entitlements & Allocation Table -->
    <table class="breakdown-table">
        <thead>
            <tr>
                <th style="width: 72%;">Item / Entitlement</th>
                <th style="width: 28%;" class="text-right">Allocated Quantity</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong style="color: #0f172a; font-size: 11px;">Ceremony Package: ' . htmlspecialchars($pkg['package_name'] ?? 'Package') . '</strong>
                    ' . $pkgFeaturesHtml . '
                </td>
                <td class="text-right"><strong style="color: #0f766e; font-size: 11.5px;">1 Graduand Pass</strong></td>
            </tr>
            ' . ($vipSeatsCount > 0 ? '
            <tr>
                <td>
                    <strong style="color: #b45309; font-size: 11px;">VIP Guest Seats (Included in Package)</strong>
                    <div style="font-size: 8.5px; color: #64748b;">Special front-row VIP reserved auditorium seating</div>
                </td>
                <td class="text-right"><strong style="color: #b45309; font-size: 11.5px;">' . $vipSeatsCount . ' VIP Seat(s)</strong></td>
            </tr>' : '') . '
            <tr>
                <td>
                    <strong style="color: #0f172a; font-size: 11px;">Additional Guest Seats</strong>
                    <div style="font-size: 8.5px; color: #64748b;">Reserved auditorium seats for guests / parents</div>
                </td>
                <td class="text-right"><strong style="color: #0f766e; font-size: 11.5px;">' . $additionalSeats . ' Seat(s)</strong></td>
            </tr>
            <tr>
                <td>
                    <strong style="color: #0f172a; font-size: 11px;">Refreshment Tokens</strong>
                    <div style="font-size: 8.5px; color: #64748b;">Special refreshment meal packs for guests</div>
                </td>
                <td class="text-right"><strong style="color: #0f766e; font-size: 11.5px;">' . $tokens . ' Token(s)</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Instructions & Verification Guidelines -->
    <div class="notes-card">
        <div class="notes-title">Instructions &amp; Verification Guidelines</div>
        <ol class="notes-list">
            <li><strong>Confirmation:</strong> All details must be carefully checked and final attendance confirmed at least <strong>07 days before the ceremony</strong>.</li>
            <li><strong>Identity Verification:</strong> Present this slip at the Verification Counter to collect your Graduation Cloak, Visitor Pass, Garland, Medal and Refreshment Pass.</li>
            <li><strong>Registration:</strong> Registration must be completed at least <strong>30 minutes before the scheduled ceremony time</strong>.</li>
            <li><strong>Dress Code:</strong> All graduands and guests must attend the ceremony wearing the prescribed formal attire.</li>
            <li><strong>Important Notice:</strong> This slip contains seat reservation and registration details only. It is <strong>NOT a valid venue entry pass</strong>. An official entry pass must be obtained from the Verification Counter.</li>
        </ol>
    </div>

    <!-- Inspirational Quote Banner (User requested) -->
    <div style="margin-top: 10px; margin-bottom: 6px; padding: 8px 14px; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 6px; text-align: center;">
        <div style="font-size: 10.5px; font-weight: 900; color: #0f766e; letter-spacing: 1px; text-transform: uppercase;">
            THIS IS NOT THE END. IT&#39;S THE BEGINNING OF SOMETHING GREATER.
        </div>
        <div style="font-size: 9px; color: #475569; margin-top: 3px; font-style: italic;">
            Celebrate Your Achievement. Believe in Yourself. Keep Growing.
        </div>
        <div style="font-size: 9px; font-weight: 800; color: #0f172a; margin-top: 3px; letter-spacing: 1.5px;">
            CEYLON PHARMA COLLEGE &bull; PLAY. LEARN. GROW.
        </div>
    </div>

    <!-- Footer: Contact Details & Official Links -->
    <div class="footer">
        <div style="font-size: 8.5px; color: #334155; margin-bottom: 2px;">
            Inquiries &amp; Assistance: <strong style="color: #0f766e;">071 5 884 884</strong> &bull; Website: <a href="https://www.pharmacollege.lk" style="color: #0f766e; text-decoration: none; font-weight: bold;">www.pharmacollege.lk</a>
        </div>
        <div style="font-size: 7.5px; color: #94a3b8;">
            Ceylon Pharma College &bull; Convocation Management System &bull; Generated: ' . date('Y-m-d H:i:s') . '
        </div>
    </div>

</body>
</html>
';

            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            $options->set('defaultFont', 'DejaVu Sans');


            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $filename = 'Convocation_Admission_' . $refNumber . '.pdf';
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            $dompdf->stream($filename, ["Attachment" => true]);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Error generating PDF: ' . $e->getMessage()]);
        }
    }
}
