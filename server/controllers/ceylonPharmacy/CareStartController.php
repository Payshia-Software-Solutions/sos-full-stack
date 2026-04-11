<?php
// controllers/ceylonPharmacy/CareStartController.php

require_once __DIR__ . '/../../models/ceylonPharmacy/CareStart.php';

class CareStartController
{
    private $careStartModel;

    public function __construct($pdo)
    {
        $this->careStartModel = new CareStart($pdo);
    }

    public function getAll()
    {
        $starts = $this->careStartModel->getAllCareStarts();
        echo json_encode($starts);
    }

    public function getById($id)
    {
        $start = $this->careStartModel->getCareStartById($id);
        if ($start) {
            echo json_encode($start);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Start not found']);
        }
    }

    public function getByStudentIdAndPresCode($student_id, $PresCode)
    {
        $start = $this->careStartModel->getCareStartByStudentIdAndPresCode($student_id, $PresCode);
        if ($start) {
            echo json_encode($start);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Start not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $lastId = $this->careStartModel->createCareStart($data);
            http_response_code(201);
            echo json_encode([
                'message' => 'Start created successfully',
                'id' => $lastId
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $this->careStartModel->updateCareStart($id, $data);
            echo json_encode(['message' => 'Start updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    public function delete($id)
    {
        $this->careStartModel->deleteCareStart($id);
        echo json_encode(['message' => 'Start deleted successfully']);
    }

    public function updatePatientStatus($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['patient_status'])) {
            $this->careStartModel->updatePatientStatus($id, $data['patient_status']);
            echo json_encode(['message' => 'Patient status updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. patient_status is required.']);
        }
    }

    public function updatePatientStatusByStudentAndPatient($student_id, $patient_id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($data['patient_status'])) {
            $this->careStartModel->updatePatientStatusStudentAndPatient($student_id, $patient_id, $data['patient_status']);
            echo json_encode(['message' => 'Patient status updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. patient_status is required.']);
        }
    }
}
