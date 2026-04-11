<?php
// controllers/ConvocationRegistrationController.php

define('PARENT_SEAT_RATE', 500);

require_once './models/ConvocationRegistration.php';
require_once './controllers/TransactionPaymentController.php';
require_once './controllers/UserFullDetailsController.php';
require_once './controllers/CertificationCenter/CcEvaluationController.php';
require_once './controllers/PackageController.php';
require_once './models/SMSModel.php';

class ConvocationRegistrationController
{
    public $model;
    private $ftpConfig;
    private $transactionPaymentController;
    private $userFullDetailsController;
    private $packageController;
    private $smsModel;
    private $convocationTemplatePath;
    private $CcEvaluationController;

    public function __construct($pdo, $convocationTemplatePath)
    {
        $this->model = new ConvocationRegistration($pdo);
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
        $paymentSlipPath = '';
        // Check if the request is multipart/form-data
        if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
            $data = $_POST; // Form fields
            $file = $_FILES['image'] ?? null; // Uploaded file (matches frontend FormData key)
            $data['payment_amount'] = 0;

            // var_dump($data);

            // Extract course_ids directly from $_POST['course_id']
            // $courseIds = isset($data['course_id']) && is_array($data['course_id']) ? $data['course_id'] : [];
            $courseIds = [];
            if (isset($data['course_id'])) {
                if (is_array($data['course_id'])) {
                    $courseIds = $data['course_id']; // Use as is if it's an array
                } else {
                    // If it's a string (like "0,1"), split it into an array
                    $courseIds = explode(',', $data['course_id']);
                }
            }            

            // Debugging: Log or output the incoming data
            error_log("Received data: " . print_r($data, true)); // Log to PHP error log
            error_log("Extracted courseIds: " . print_r($courseIds, true)); // Log courseIds array

            // Required fields validation
            if (
                !isset($data['student_number']) ||
                empty($courseIds) || // Check if $courseIds array is empty
                !isset($data['package_id'])
            ) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: student_number, course_id, package_id']);
                return;
            }

            // Convert course_ids array to a comma-separated string
            $courseIdsString = implode(',', $courseIds);

            // Handle file upload if provided
            $paymentSlipPath = null;
            if (!empty($file) && $file['error'] === UPLOAD_ERR_OK) {
                $fileTmpPath = $file['tmp_name'];

                // Generate SHA-256 hash of the image file (optional for duplicate checking)
                $imageHash = hash_file('sha256', $fileTmpPath);
                $data['hash_value'] = $imageHash;

                // File details
                $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
                $fileName = $data['student_number'] . "-payment-" . uniqid() . '.' . $fileExtension;
                $localUploadPath = './uploads/' . $fileName; // Temporary local storage
                $ftpFilePath = "/payment-slips/" . $fileName; // Path on FTP server

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
                    $paymentSlipPath = $ftpFilePath; // Store FTP path
                    unlink($localUploadPath); // Remove local file after successful FTP upload
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'FTP upload failed']);
                    return;
                }
            }

            // Create registration in the database
            $registration_id = $this->model->createRegistration(
                $data['student_number'],
                $courseIdsString,
                $data['package_id'],
                $data['event_id'] ?? null,
                $data['payment_status'] ?? 'pending',
                $data['payment_amount'] ?? null,
                $data['registration_status'] ?? 'pending',
                $data['hash_value'] ?? null,
                $paymentSlipPath,
                $data['additional_seats'] ?? 0,
                $data['session'] ?? 1,
                $data['convocation_id'] ?? null // ADDED
            );
            http_response_code(201);
            echo json_encode([
                'package_id' => $data['package_id'],
                'registration_id' => $registration_id,
                'reference_number' => $registration_id,
                'message' => 'Registration created successfully',
                'payment_slip_path' => $paymentSlipPath
            ]);
        } else {
            // Fallback for JSON (if no file is sent)
            $data = json_decode(file_get_contents('php://input'), true);
            $courseIds = isset($data['course_id']) ? (is_array($data['course_id']) ? $data['course_id'] : [$data['course_id']]) : [];

            // Debugging: Log or output the incoming data
            error_log("Received JSON data: " . print_r($data, true));
            error_log("Extracted courseIds: " . print_r($courseIds, true));

            if (
                !isset($data['student_number']) ||
                empty($courseIds) ||
                !isset($data['package_id'])
            ) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: student_number, course_id, package_id']);
                return;
            }

            $courseIdsString = implode(',', $courseIds);

            $registration_id = $this->model->createRegistration(
                $data['student_number'],
                $courseIdsString,
                $data['package_id'],
                $data['event_id'] ?? null,
                $data['payment_status'] ?? 'pending',
                $data['payment_amount'] ?? null,
                $data['registration_status'] ?? 'pending',
                $data['hash_value'] ?? null,
                $paymentSlipPath,
                $data['additional_seats'] ?? 0,
                $data['session'] ?? 1,
                $data['convocation_id'] ?? null // ADDED
            );
            http_response_code(201);
            echo json_encode([
                'registration_id' => $registration_id,
                'reference_number' => $registration_id,
                'message' => 'Registration created successfully'
            ]);
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
        $success = $this->model->deleteRegistration($registration_id);
        if ($success) {
            echo json_encode(['message' => 'Registration deleted successfully']);
        } else {
            http_response_code(404);
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

        $paymentAmount = $data['payment_amount'];
        $recInfo = $this->model->getRegistrationByReference($reference_number);
        $student_number = $recInfo['student_number'];
        $convocation_id = $recInfo['convocation_id'];
        $recAmount = $recInfo['payment_amount'];

        $paybleAmount = $this->model->getPayableAmount($reference_number);
        $paidAmount = $this->transactionPaymentController->model->getPaidAmount($student_number, 'covocation-payment-'.$convocation_id,);
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
        } else {
            // Log the payment creation
            // echo json_encode("Payment record created successfully for reference number: $reference_number");
        }


        $updated = $this->model->updatePayment($reference_number, $data['payment_status'], $updatePaymentAmount);

        if ($updated) {
            // Prepare the welcome message
            $mobile = $studentInfo['telephone_1']; // Assuming 'phone_number' is the key for the user's mobile number
            $studentName = $studentInfo['name_on_certificate']; // Combine first and last name
            $referenceNumber = $reference_number; // Use the user ID as the reference number

            // Send the welcome 
            // $smsResponse = $this->smsModel->sendConvocationPaymentApprovedSMS($mobile, $studentName, $referenceNumber, $txnNumber, $paymentAmount);
            // var_dump($smsResponse);

            // Check if the SMS was sent successfully
            // if ($smsResponse['status'] === 'error') {
            //     throw new Exception('Failed to send SMS: ' . $smsResponse['message']);
            // }

            // Return success response with the new user's ID
            http_response_code(201); // Created successfully
            echo json_encode([
                'status' => 'Success',
                'message' => 'Payment record created and convocation updated',
                'reference_number' => $reference_number,
                // 'sms_status' => $smsResponse['status'],
                // 'sms_message' => $smsResponse['message']
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
            http_response_code(404);   // Not Found
            echo json_encode(['status' => 'error', 'message' => 'Registration not found', 'reference_number' => $reference_number]);
            return;
        }

        $studentNumber  = $registration['student_number'];
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

        /* For test‑only: override real mobile with a fixed number */
        // $mobile = "0770481363";

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
                throw new RuntimeException('SMS gateway returned failure');
            }
        } catch (Exception $e) {
            http_response_code(502);   // Bad Gateway – downstream service failed
            echo json_encode(['status' => 'error', 'message' => 'SMS send failed: ' . $e->getMessage()]);
            return;
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
        $ceremony_number = $data['ceremony_number'];

        // Make sure the registration exists
        $registration = $this->model->getRegistrationByReference($reference_number);
        if (!$registration) {
            http_response_code(404);
            echo json_encode(['error' => 'Registration not found']);
            return;
        }

        // Persist the new ceremony number
        if (!$this->model->updateCeremonyNumber($reference_number, $ceremony_number)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update convocation registration']);
            return;
        }

        // 🔔 Trigger SMS logic (balances looked‑up inside)
        $this->notifyCeremonyNumber($reference_number);

        http_response_code(200);
        echo json_encode([
            'status'           => 'success',
            'ceremony_number'  => $ceremony_number,
            'reference_number' => $reference_number,
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
        $certificate_id = $data['certificate_id'];
        $updated = $this->model->updateCertificatePrintStatus($$certificate_print_status, $reference_number, $certificate_id,);
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
        $advanced_certifiate_id = $data['advanced_certifiate_id'];

        $updated = $this->model->updateAdvancedCertificatePrintStatus($advanced_print_status, $reference_number, $advanced_certifiate_id);
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
