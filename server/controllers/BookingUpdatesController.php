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
     * Generates a certificate for a booking or direct student request.
     */
    public function generateCertificate()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $bookingId = $data['booking_id'] ?? null;
        $studentNumber = $data['student_number'] ?? $data['student_id'] ?? null;
        $courseCodeInput = $data['course_code'] ?? $data['parentCourseCode'] ?? null;
        $printBy = $data['print_by'] ?? 'system';

        if (!$bookingId && !$studentNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID or Student Number is required.']);
            return;
        }

        if ($bookingId) {
            $bookingInfo = $this->convocationRegistrationModel->getRegistrationById($bookingId);
            if (!$bookingInfo) {
                http_response_code(404);
                echo json_encode(['error' => 'Booking not found.']);
                return;
            }
            $studentNumber = $bookingInfo['student_number'];
            $courseIds = explode(',', $bookingInfo['course_id']);
        } else {
            $courseIds = is_array($courseCodeInput) ? $courseCodeInput : explode(',', (string)$courseCodeInput);
        }

        $generatedCertificates = [];

        foreach ($courseIds as $courseCode) {
            $courseCode = trim((string)$courseCode);
            if (empty($courseCode)) {
                continue;
            }

            $sc = $this->studentCourseModel->getByStudentNumberAndParentCourseId($studentNumber, $courseCode);
            $batchCode = (!empty($sc) && !empty($sc['course_code'])) ? $sc['course_code'] : $courseCode;

            $existingCertificate = $this->userCertificatePrintStatusNewModel->getByStudentNumberCourseCodeAndType($studentNumber, $batchCode, 'Certificate');
            if (!$existingCertificate && $batchCode !== $courseCode) {
                $existingCertificate = $this->userCertificatePrintStatusNewModel->getByStudentNumberCourseCodeAndType($studentNumber, $courseCode, 'Certificate');
            }

            if ($existingCertificate) {
                $generatedCertificates[] = [
                    'course_code' => $batchCode,
                    'certificate_id' => $existingCertificate['id'] ?? ($existingCertificate['certificate_id'] ?? null),
                    'status' => 'already_exists'
                ];
                continue;
            }
            
            $certificateData = [
                'student_number' => $studentNumber,
                'course_code' => $batchCode,
                'type' => 'Certificate',
                'print_status' => 'generated',
                'print_by' => $printBy
            ];

            try {
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
