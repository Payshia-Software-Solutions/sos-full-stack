<?php
// controllers/CertificationCenter/CcCertificateListController.php

require_once './models/CertificationCenter/CcEvaluation.php';

class CcEvaluationController
{
    public $model;
    public function __construct($pdo)
    {
        $this->model = new CcEvaluation($pdo);
    }

    public function GetCeylonPharmacyRecoveredCount($CourseCode, $loggedUser)
    {
        // Call the model method
        $recoveredPatients = $this->model->GetRecoveredPatientsByCourse($CourseCode, $loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode($recoveredPatients);
    }


    public function GetPharmaHunterProgress($loggedUser)
    {
        // Call the model method
        $hunterProgress = $this->model->HunterProgress($loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode($hunterProgress);
    }

    public function getHunterProProgress($courseCode, $loggedUser)
    {
        // Call the model method
        $hunterProProgress = $this->model->getHunterProProgress($courseCode, $loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode($hunterProProgress);
    }

    public function GetAssignmentGrades($courseCode, $loggedUser)
    {
        // Call the model method
        $assignmentGrades = $this->model->calculateAssignmentsGrades($courseCode, $loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode($assignmentGrades);
    }

    public function GetStudentBalance($loggedUser)
    {
        // Call the model method
        $studentBalance = $this->model->GetStudentBalance($loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode($studentBalance);
    }

    public function GetCertificationEvaluation($courseCode, $loggedUser)
    {

        $recoveredPatients = $this->model->GetRecoveredPatientsByCourse($courseCode, $loggedUser);
        $hunterProgress = $this->model->HunterProgress($loggedUser);
        $hunterProProgress = $this->model->getHunterProProgress($courseCode, $loggedUser);
        $assignmentGrades = $this->model->calculateAssignmentsGrades($courseCode, $loggedUser);
        $studentBalance = $this->model->GetStudentBalance($loggedUser);
        $studentInfo = $this->model->GetLmsStudentsByUserName($loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode([
            'title' => 'Certificate Evaluation',
            'studentInfo' => $studentInfo,
            'recoveredPatients' => $recoveredPatients,
            'hunterProgress' => $hunterProgress,
            'hunterProProgress' => $hunterProProgress,
            'assignmentGrades' => $assignmentGrades,
            'studentBalance' => $studentBalance,
        ]);
    }

    public function GetStudentFullDetails($loggedUser)
    {
        $studentBalance = $this->model->GetStudentBalance($loggedUser);
        $studentInfo = $this->model->GetLmsStudentsByUserName($loggedUser);
        $studentEnrollments = $this->model->getUserEnrollmentsFullDetails($loggedUser);

        // Respond with JSON
        http_response_code(200);
        echo json_encode([
            'title' => 'Student Full Information',
            'studentInfo' => $studentInfo,
            'studentBalance' => $studentBalance,
            'studentEnrollments' => $studentEnrollments,
        ]);
    }
}
