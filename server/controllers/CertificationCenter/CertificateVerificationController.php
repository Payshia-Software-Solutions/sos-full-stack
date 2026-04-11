<?php
// controllers/CertificationCenter/CcCertificateListController.php

require_once './models/CertificationCenter/CertificateVerification.php';

class CertificateVerificationController
{
    private $model;
    public function __construct($pdo)
    {
        $this->model = new CertificateVerification($pdo);
    }

    
    public function GetCertificateVerification($userName)
    {

        $userEnrollment = $this->model->getUserEnrollments($userName);
        $studentInfo = $this->model->GetLmsStudentsByUserName($userName);
        $CourseResultInfo = $this->model->GetResultByUserName($userName);
        // $userGradeDetails = $this->model->getGradeDetails($userName);

        // Respond with JSON getGradeDetails
        http_response_code(200);
        echo json_encode([
            'title' => 'Certificate Verification',
            'studentInfo' => $studentInfo,
            'userEnrollment' => $userEnrollment,
            'CourseResultInfo' => $CourseResultInfo,
            // 'userGradeDetails' => $userGradeDetails,
           
        ]);
    }
}
