<?php
// controllers/DpadController.php

require_once './models/Dpad/DpadModel.php';

class DpadController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new DpadModel($pdo);
    }

    public function getActivePrescriptions()
    {
        $prescriptions = $this->model->getActivePrescriptions();
        echo json_encode($prescriptions);
    }

    public function getSubmittedAnswers($loggedUser)
    {
        $answers = $this->model->getSubmittedAnswersByUser($loggedUser);
        echo json_encode($answers);
    }

    public function getPrescriptionCovers($prescriptionId)
    {
        $covers = $this->model->getPrescriptionCoversDpad($prescriptionId);
        echo json_encode($covers);
    }

    public function getPrescriptionDetails($prescriptionId)
    {
        $details = $this->model->getPrescriptionDetails($prescriptionId);
        echo json_encode($details);
    }

    public function submitAnswer($loggedUser)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $result = $this->model->submitAnswer($loggedUser, $input);
        echo json_encode($result);
    }

    public function getOverallGrade($loggedUser, $courseCode = null)
    {
        $overallGrade = $this->model->calculateOverallGradeDpad($loggedUser, $courseCode);
        echo json_encode($overallGrade);
    }

    public function getAllPrescriptions()
    {
        $prescriptions = $this->model->getAllPrescriptions();
        echo json_encode($prescriptions);
    }

    public function savePrescription()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $result = $this->model->savePrescription($input);
        echo json_encode($result);
    }

    public function updateStatus()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $prescriptionId = $input['prescriptionId'] ?? '';
        $status = $input['status'] ?? '';

        $result = $this->model->updatePrescriptionStatus($prescriptionId, $status);
        echo json_encode($result);
    }

    public function saveAnswerKey($loggedUser)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $result = $this->model->saveAnswerKey($loggedUser, $input);
        echo json_encode($result);
    }

    public function getAnswerKey($prescriptionId, $coverId)
    {
        $result = $this->model->getAnswerKey($prescriptionId, $coverId);
        echo json_encode($result);
    }

    // ─── Course Assignment Methods ─────────────────────────────────────────────

    public function getActivePrescriptionsByCourse($courseCode)
    {
        $prescriptions = $this->model->getActivePrescriptionsByCourse($courseCode);
        echo json_encode($prescriptions);
    }

    public function assignToCourse()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $prescriptionId = $input['prescription_id'] ?? '';
        $courseCode     = $input['course_code']     ?? '';
        $assignedBy     = $input['assigned_by']     ?? null;

        if (!$prescriptionId || !$courseCode) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'prescription_id and course_code are required']);
            return;
        }

        $result = $this->model->assignToCourse($prescriptionId, $courseCode, $assignedBy);
        echo json_encode($result);
    }

    public function unassignFromCourse()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $prescriptionId = $input['prescription_id'] ?? '';
        $courseCode     = $input['course_code']     ?? '';

        if (!$prescriptionId || !$courseCode) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'prescription_id and course_code are required']);
            return;
        }

        $result = $this->model->unassignFromCourse($prescriptionId, $courseCode);
        echo json_encode($result);
    }

    public function getCoursesByPrescription($prescriptionId)
    {
        $courses = $this->model->getCoursesByPrescription($prescriptionId);
        echo json_encode($courses);
    }

    public function getAllCourseAssignments()
    {
        $assignments = $this->model->getAllCourseAssignments();
        echo json_encode($assignments);
    }
}

