<?php
// controllers/BookingUpdatesController.php

require_once './models/ConvocationRegistration.php';
require_once './models/UserCertificatePrintStatusNew.php';
require_once './models/Course/Course.php';
require_once './models/StudentCourseModelNew.php';


class BookingUpdatesController
{
    private $pdo;
    private $convocationRegistrationModel;
    private $userCertificatePrintStatusNewModel;
    private $courseModel;
    private $studentCourseModel;



    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->convocationRegistrationModel = new ConvocationRegistration($this->pdo);
        $this->userCertificatePrintStatusNewModel = new UserCertificatePrintStatusNew($this->pdo);
        $this->courseModel = new Course($this->pdo);
        $this->studentCourseModel = new StudentCourseModelNew($this->pdo);
    }

    /**
     * Generates a certificate for a booking.
     */
    public function generateCertificate()
    {
        // Get the booking ID from the POST request
        $data = json_decode(file_get_contents('php://input'), true);
        $bookingId = $data['booking_id'] ?? null;

        if (!$bookingId) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID is required.']);
            return;
        }

        // Get booking information
        $bookingInfo = $this->convocationRegistrationModel->getRegistrationById($bookingId);

        if (!$bookingInfo) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found.']);
            return;
        }

        $studentNumber = $bookingInfo['student_number'];
        $studentEnrollments = $this->studentCourseModel->getByStudentNumber($studentNumber);

        $courseIds = explode(',', $bookingInfo['course_id']);
        $generatedCertificates = [];

        foreach ($courseIds as $courseCode) {
            $courseCode = trim($courseCode);
            $batchCode = $this->studentCourseModel->getByStudentNumberAndParentCourseId($studentNumber, $courseCode)['course_code'];
            
            if (empty($courseCode)) {
                continue;
            }
            $existingCertificate = $this->userCertificatePrintStatusNewModel->getByStudentNumberCourseCodeAndType($studentNumber, $batchCode, 'Certificate');
            if ($existingCertificate) {
                $generatedCertificates[] = [
                    'course_code' => $batchCode,
                    'certificate_id' => $existingCertificate['id'],
                    'status' => 'already_exists'
                ];
                continue;
            }
            
            // Data for the new certificate status entry
            $certificateData = [
                'student_number' => $studentNumber,
                'course_code' => $batchCode,
                'type' => 'Certificate',
                'print_status' => 'generated',
                'print_by' => 'system' // Assuming 'system' as the default user for generation
            ];

            try {
                // Create a new certificate entry and get the generated ID
                $certificateId = $this->userCertificatePrintStatusNewModel->createStatus($certificateData);
                $generatedCertificates[] = [
                    'course_code' => $batchCode,
                    'certificate_id' => $certificateId,
                    'status' => 'success'
                ];
            } catch (Exception $e) {
                $generatedCertificates[] = [
                    'course_code' => $batchCode,
                    'certificate_id' => null,
                    'status' => 'failed',
                    'error' => $e->getMessage()
                ];
            }
        }

        http_response_code(200);
        echo json_encode([
            'message' => 'Certificate generation process completed.',
            'booking_id' => $bookingId,
            'student_number' => $studentNumber,
            'generated_certificates' => $generatedCertificates
        ]);
    }
}
