<?php
// controllers/ConvocationRegistrationController.php

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

        // 2. Check Session Capacity Limits
        if ($convocationId) {
            $convocation = $this->convocationModel->getConvocationById($convocationId);
            if ($convocation) {
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
                $convocationId
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
            $updated_data['additional_seats']
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
     * Send the appropriate ceremony‑related SMS and return a JSON status block.
     *
     * Contract:
     *   - Success  → HTTP 200 + { status: "success", ...extraInfo }
     *   - Business error (e.g. missing data) → HTTP 400 + { status: "error", message: "..." }
     *   - System/runtime error              → HTTP 500 + { status: "error", message: "..." }
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

        // 🔔 Trigger SMS logic cleanly
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

        $convocationBalance = ($package['price'] + ($registration['additional_seats'] * PARENT_SEAT_RATE)) - $registration['payment_amount'];
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

        $convocationBalance = ($package['price'] + ($registration['additional_seats'] * PARENT_SEAT_RATE)) - $registration['payment_amount'];
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

}
